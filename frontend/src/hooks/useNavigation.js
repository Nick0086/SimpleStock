import { useNavigate, useLocation } from 'react-router';

export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    navigate,
    location,
    goBack: () => navigate(-1),
    goTo: (path) => navigate(path),
    goToWithState: (path, state) => navigate(path, { state })
  };
} 