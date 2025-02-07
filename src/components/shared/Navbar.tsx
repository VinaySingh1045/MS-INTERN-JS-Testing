import { FieldTimeOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Menu, Modal, Popover, Form, message, Space } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginApiTelegram, SubmitApiTelegram } from "../../services/telegramAPI";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchTelegram } from "../../redux/actions/telegramActions";
import { LogoutApi } from "../../services/authAPI";
import { setUser } from "../../redux/slices/authSlice";
import { clearTelegramData } from "../../redux/slices/telegramSlice";
import { API_END_POINT } from "../../utils/constants";

const Navbar = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    const { telegramUser } = useSelector((state: RootState) => state.telegramAuth)
    const { user } = useSelector((state: RootState) => state.auth)

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate()
    const handleCancel = () => {
        setIsModalOpen(false);
        setIsOtpStep(false);
        setPhoneNumber("");
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const [current, setCurrent] = useState("timelog");

    const onMenuClick = (e) => {
        setCurrent(e.key);
        if (e.key === "profile") {
            navigate("/profile");
        } else if (e.key === "timelog") {
            navigate("/");
        }
    };

    const handleLogout = async () => {
        await LogoutApi()
        dispatch(setUser(null));
        dispatch(clearTelegramData());
        navigate("/login");
        message.success("Logged out successfully!");
    }

    const popoverContent = (
        <div>
            <Space direction="vertical">
                <Button onClick={() => onMenuClick({ key: "profile" })} type="text" icon={<UserOutlined />}>
                    Profile
                </Button>
                <Button onClick={handleLogout} type="text" icon={<LogoutOutlined />}>
                    Logout
                </Button>
            </Space>
        </div>
    );

    const handleLogin = async (values) => {
        setIsOtpStep(true);
        try {
            const phoneWithCountryCode = `+91${values.phone}`;
            setPhoneNumber(phoneWithCountryCode);
            await LoginApiTelegram(phoneWithCountryCode);
            dispatch(fetchTelegram())
        } catch (error) {
            console.error("Error while sending phone number:", error);
            message.error("Failed to send code. Please try again.");
        }
    };
    const handleOtpSubmit = async (values) => {
        try {
            await SubmitApiTelegram({ phone: phoneNumber, code: values.code })
            message.success("Logged in successfully!");
            handleCancel();
        } catch (error) {
            message.error(error.response?.data?.error || "Invalid code. Please try again.");
        }
    };

    const googleLogin = async () => {
        window.location.href = `${API_END_POINT}/G_login`
    };


    useEffect(() => {
        dispatch(fetchTelegram());
        if (location.pathname === "/profile") {
            setCurrent("profile");
        } else {
            setCurrent("timelog");
        }
    }, [dispatch]);

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #e0e0e0",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    padding: "0px 20px",
                }}
            >
                <Menu
                    onClick={onMenuClick}
                    selectedKeys={[current]}
                    style={{
                        display: "flex",
                        gap: "1px",
                    }}
                    mode="horizontal"
                    items={[
                        { key: "timelog", icon: <FieldTimeOutlined />, label: <Link to={"/"}>Timelog</Link> },
                    ]}
                ></Menu>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>

                    {
                        telegramUser?.google?.tokens?.access_token ?
                            <Button disabled type="default">Connect Google</Button>
                            :
                            <Button onClick={googleLogin} type="default">Connect Google</Button>
                    }
                    {telegramUser?.telegram?.session_id ? (
                        <Button type="default" disabled>
                            Telegram Connected
                        </Button>
                    ) : (
                        <>
                            <Button onClick={showModal} type="default">
                                Connect Telegram
                            </Button>

                            <Modal
                                title={isOtpStep ? "Enter OTP" : "Connect Telegram"}
                                open={isModalOpen}
                                footer={null}
                                onCancel={handleCancel}
                            >
                                <Form
                                    onFinish={isOtpStep ? handleOtpSubmit : handleLogin}
                                    layout="vertical"
                                >
                                    {!isOtpStep && (
                                        <Form.Item
                                            label="Phone Number"
                                            name="phone"
                                            rules={[
                                                { required: true, message: "Please enter your phone number!" },
                                                {
                                                    pattern: /^[0-9]{10}$/,
                                                    message: "Phone number must be 10 digits.",
                                                },
                                            ]}
                                        >
                                            <Input placeholder="Enter your phone number" />
                                        </Form.Item>
                                    )}
                                    {isOtpStep && (
                                        <Form.Item
                                            label="Code (For OTP See the Telegram Chat) "
                                            name="code"
                                            rules={[
                                                { required: true, message: "Please enter the code!" },
                                                {
                                                    pattern: /^[0-9]{5}$/,
                                                    message: "Code must be 5 digits.",
                                                },
                                            ]}
                                        >
                                            <Input placeholder="Enter the code" />
                                        </Form.Item>
                                    )}
                                    <Form.Item style={{marginBottom:"10px"}}>
                                        <Button type="primary" htmlType="submit" >
                                            {isOtpStep ? "Submit OTP" : "Send Code"}
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </>
                    )}
                    {user &&
                        <Popover content={popoverContent} trigger="click">
                            <span>
                                <span style={{ cursor: "pointer", marginRight: "7px" }}>{user.fullName}</span>
                                <Avatar src={telegramUser?.google?.profile?.picture} style={{ marginRight: "7px", cursor: "pointer" }} icon={<UserOutlined />} />
                            </span>
                        </Popover>
                    }
                </div>
            </div>
        </>
    );
};

export default Navbar;
