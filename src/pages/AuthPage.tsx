import React, { useEffect, useState } from "react";
import {
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    InputAdornment,
    IconButton,
    Stack,
    FormControlLabel,
    Checkbox,
    // Link,
    // Divider,
} from "@mui/material";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useLogin } from "../hooks/useLogin";
import "../index.css";

export default function LoginPage() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState<boolean>(() => localStorage.getItem("rememberMe") === "true");

    const { mutate: login, isPending } = useLogin();


    useEffect(() => {
        const savedUsername = localStorage.getItem("savedUsername");
        const savedPassword = sessionStorage.getItem("savedPassword");
        if (savedUsername) setUsername(savedUsername);
        if (savedPassword) setPassword(savedPassword);
    }, []);


    useEffect(() => {
        localStorage.setItem("rememberMe", String(rememberMe));
        if (rememberMe) {
            localStorage.setItem("savedUsername", username);
            sessionStorage.setItem("savedPassword", password);
        } else {
            localStorage.removeItem("savedUsername");
            sessionStorage.removeItem("savedPassword");
        }
    }, [rememberMe, username, password]);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login({ username, password });
    };

    return (
        <Box
            component="main"
            sx={{
                minHeight: "100svh",
                display: "grid",
                placeItems: "center",
                position: "relative",
                overflow: "hidden",
                px: 2,
                py: { xs: 6, md: 8 },
                fontFamily: "var(--font-vazir)",
                bgcolor: "background.default",
            }}
            className="bg-[radial-gradient(1000px_500px_at_-10%_-10%,rgba(99,102,241,0.15),transparent_60%),radial-gradient(1000px_500px_at_110%_110%,rgba(236,72,153,0.15),transparent_60%)]"
        >
            <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-40 blur-3xl bg-gradient-to-tr from-indigo-400 to-pink-300 animate-pulse" />
            <div className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full opacity-40 blur-3xl bg-gradient-to-br from-blue-300 to-fuchsia-300 animate-pulse" />

            <Card
                elevation={10}
                sx={{
                    width: "100%",
                    maxWidth: 440,
                    borderRadius: 4,
                    backdropFilter: "saturate(140%) blur(8px)",
                    boxShadow: (theme) => `0 10px 30px ${theme.palette.mode === "dark" ? "#00000066" : "#00000022"}`,
                    transition: "transform 250ms ease, box-shadow 250ms ease",
                    "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: (theme) => `0 14px 38px ${theme.palette.mode === "dark" ? "#00000088" : "#00000033"}`,
                    },
                    fontFamily: "var(--font-vazir)",
                }}
                className="shadow-2xl"
            >
                <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                    <Stack spacing={3} alignItems="center">
                        <Box sx={{ width: 72, height: 72, borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
                            <img src="/logo/Logo.png" alt="لوگو" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </Box>

                        <Box textAlign="center">
                            <Typography variant="h4" fontWeight={800} letterSpacing={0.4}>
                                خوش آمدید
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                لطفا برای ادامه وارد شوید
                            </Typography>
                        </Box>

                        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                            <Stack spacing={2.25}>
                                <TextField
                                    label="نام کاربری"
                                    placeholder="behrooz mohammadi nasab"
                                    autoComplete="username"
                                    fullWidth
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaUser size={16} />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                                />

                                <TextField
                                    label="رمز عبور"
                                    placeholder="••••••••"
                                    fullWidth
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FaLock size={16} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                                                        onClick={() => setShowPassword((s) => !s)}
                                                        edge="end"
                                                        size="small"
                                                    >
                                                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
                                />

                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                        }
                                        label={<Typography variant="body2">مرا به خاطر بسپار</Typography>}
                                    />

                                </Stack>

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={isPending}
                                    fullWidth
                                    startIcon={isPending ? <CircularProgress size={18} /> : undefined}
                                    sx={{
                                        py: 1.2,
                                        borderRadius: 2.5,
                                        textTransform: "none",
                                        fontWeight: 700,
                                        letterSpacing: 0.2,
                                        boxShadow: "none",
                                        "&:hover": { boxShadow: "none", transform: "translateY(-1px)" },
                                        transition: "transform 180ms ease",
                                    }}
                                >
                                    {isPending ? "در حال ورود..." : "ورود"}
                                </Button>

                                {/*<Divider flexItem />*/}
                                {/*<Typography variant="body2" color="text.secondary" textAlign="center">*/}
                                {/*    حساب کاربری ندارید؟ {" "}*/}
                                {/*    <Link href="#" underline="hover">ایجاد کنید</Link>*/}
                                {/*</Typography>*/}
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
