-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    device_info TEXT,
    ip_address VARCHAR(45)
);

-- Verification tokens table
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'email',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Magic links table
CREATE TABLE magic_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

-- OTP tokens table
CREATE TABLE otp_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(6) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'login', 'registration', 'password_reset'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP WITH TIME ZONE
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_id UUID REFERENCES refresh_tokens(id) ON DELETE CASCADE,
    device_info TEXT,
    ip_address VARCHAR(45),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Auth logs table
CREATE TABLE auth_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'password_reset', etc.
    status VARCHAR(50) NOT NULL, -- 'success', 'failure'
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_user ON verification_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_email ON magic_links(email);
CREATE INDEX idx_otp_tokens_user_type ON otp_tokens(user_id, type);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_auth_logs_user_action ON auth_logs(user_id, action);
CREATE INDEX idx_auth_logs_created_at ON auth_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired tokens
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Delete expired tokens
    DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM verification_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM magic_links WHERE expires_at < CURRENT_TIMESTAMP;
    DELETE FROM otp_tokens WHERE expires_at < CURRENT_TIMESTAMP;
    
    -- Log the cleanup
    INSERT INTO auth_logs (action, status, details)
    VALUES (
        'token_cleanup',
        'success',
        jsonb_build_object(
            'timestamp', CURRENT_TIMESTAMP,
            'type', 'system'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to revoke all user tokens
CREATE OR REPLACE FUNCTION revoke_user_tokens(user_id_param UUID)
RETURNS void AS $$
BEGIN
    -- Revoke refresh tokens
    UPDATE refresh_tokens 
    SET revoked = true 
    WHERE user_id = user_id_param;
    
    -- Delete other tokens
    DELETE FROM verification_tokens WHERE user_id = user_id_param;
    DELETE FROM password_reset_tokens WHERE user_id = user_id_param;
    DELETE FROM otp_tokens WHERE user_id = user_id_param;
    
    -- Update user sessions
    UPDATE user_sessions 
    SET is_active = false 
    WHERE user_id = user_id_param;
    
    -- Log the action
    INSERT INTO auth_logs (user_id, action, status, details)
    VALUES (
        user_id_param,
        'revoke_tokens',
        'success',
        jsonb_build_object(
            'timestamp', CURRENT_TIMESTAMP,
            'type', 'security'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to log auth events
CREATE OR REPLACE FUNCTION log_auth_event(
    user_id_param UUID,
    action_param VARCHAR,
    status_param VARCHAR,
    ip_address_param VARCHAR,
    user_agent_param TEXT,
    details_param JSONB
)
RETURNS void AS $$
BEGIN
    INSERT INTO auth_logs (
        user_id,
        action,
        status,
        ip_address,
        user_agent,
        details
    ) VALUES (
        user_id_param,
        action_param,
        status_param,
        ip_address_param,
        user_agent_param,
        details_param
    );
END;
$$ LANGUAGE plpgsql;

-- Add some useful views
CREATE VIEW active_sessions AS
SELECT 
    s.id as session_id,
    u.email,
    s.device_info,
    s.ip_address,
    s.last_active,
    s.created_at as session_start
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.is_active = true;

CREATE VIEW failed_login_attempts AS
SELECT 
    user_id,
    ip_address,
    COUNT(*) as attempt_count,
    MAX(created_at) as last_attempt
FROM auth_logs
WHERE action = 'login' AND status = 'failure'
GROUP BY user_id, ip_address;

-- Add comments to tables
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE refresh_tokens IS 'Stores JWT refresh tokens';
COMMENT ON TABLE verification_tokens IS 'Stores email verification tokens';
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens';
COMMENT ON TABLE magic_links IS 'Stores magic link tokens for passwordless login';
COMMENT ON TABLE otp_tokens IS 'Stores one-time passwords for various purposes';
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions';
COMMENT ON TABLE user_profiles IS 'Stores additional user profile information';
COMMENT ON TABLE auth_logs IS 'Audit log for authentication events';

-- Run token cleanup daily
SELECT cron.schedule('0 0 * * *', 'SELECT clean_expired_tokens();');