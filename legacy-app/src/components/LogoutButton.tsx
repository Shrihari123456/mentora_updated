// LogoutButton.tsx
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Button variant="contained" color="secondary" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
