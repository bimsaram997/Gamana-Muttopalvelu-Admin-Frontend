import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Button,
    Divider,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

const DRAWER_WIDTH = 240;

const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Bookings", path: "/bookings" },
    { label: "Offers", path: "/offers" },
    { label: "Invoices", path: "/invoices" },
    { label: "Global Settings", path: "/settings" },
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation(); //give currentt URL

    const { user, logout } = useAuth();   // 👈 pull user + logout from context

    const handleLogout = () => {
        logout();                            // 👈 updates context + clears storage
        navigate("/login");
    };

    return (
        <Box sx={{ display: "flex" }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" noWrap>
                        Gamanamuutto Admin
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {/* Show logged-in user's name */}
                        {user && (
                            <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                {user.name}
                            </Typography>
                        )}
                        <Button color="inherit" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Box>

                </Toolbar>
            </AppBar>

            {/* ===== Sidebar Drawer ===== */}
            <Drawer
                variant="permanent"
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: DRAWER_WIDTH,
                        boxSizing: "border-box",
                    },
                }}
            >
                <Toolbar /> {/* spacer so content starts below AppBar */}
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        {navItems.map((item) => {
                            const selected = location.pathname === item.path;
                            return (
                                <ListItem key={item.path} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        to={item.path}
                                        selected={selected}
                                    >
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                    <Divider />
                </Box>
            </Drawer>
            {/* ===== Main content ===== */}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
            >
                <Toolbar /> {/* spacer for the fixed AppBar */}
                <Outlet />
            </Box>
        </Box>
    );

}