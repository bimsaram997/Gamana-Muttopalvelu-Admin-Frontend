import { useState } from "react";
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
    Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useAuth } from "../../hooks/useAuth";

const DRAWER_WIDTH = 240;

const mainNavItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Bookings", path: "/bookings" },
    { label: "Offers", path: "/offers" },
    { label: "Invoices", path: "/invoices" },
];

const settingsSubItems = [
    { label: "Packages", path: "/settings/packages" },
    { label: "Key Services", path: "/settings/key-services" },
    { label: "Process Steps", path: "/settings/process-steps" },
    { label: "Detailed Steps", path: "/settings/detailed-steps" },
    { label: "Reviews", path: "/settings/reviews" },
    { label: "Form Options", path: "/settings/form-options" },
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Track if the settings menu is manually toggled open
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Check if we are inside any settings route
    const isSettingsRoute = location.pathname.startsWith("/settings");
    
    // The menu should be open if the user opened it OR if they are on a settings route
    const isMenuExpanded = settingsOpen || isSettingsRoute;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSettingsClick = () => {
        // Just toggle the menu — do NOT navigate
        setSettingsOpen(!settingsOpen);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="h6" noWrap>
                        Gamanamuutto Admin
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                <Toolbar />
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        {/* Main Items */}
                        {mainNavItems.map((item) => (
                            <ListItem key={item.path} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    selected={
                                        item.path === "/bookings" 
                                            ? location.pathname.startsWith("/bookings")
                                            : location.pathname === item.path
                                    }
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}

                        {/* Global Settings Collapsible Menu */}
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleSettingsClick}>
                                <ListItemText primary="Global Settings" />
                                {isMenuExpanded ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        
                        <Collapse in={isMenuExpanded} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {settingsSubItems.map((subItem) => (
                                    <ListItem key={subItem.path} disablePadding>
                                        <ListItemButton
                                            component={Link}
                                            to={subItem.path}
                                            sx={{ pl: 4 }} // Indent
                                            selected={location.pathname === subItem.path}
                                        >
                                            <ListItemText primary={subItem.label} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </List>
                    <Divider />
                </Box>
            </Drawer>

            {/* ===== Main content ===== */}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
}