"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Form, Input, Button, Card, Alert, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Достаём url, куда юзер хотел попасть (если перенаправил middleware)
  const redirectFrom = searchParams.get("from") || "/admin";

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "Неверный логин или пароль");
      }

      // Если всё ок — кука auth_token уже проставилась через Set-Cookie от FastAPI.
      // Мгновенно редиректим в админку:
      router.push(redirectFrom);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при входе");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#0d0f12", // тёмный фон под дизайн проекта
      }}
    >
      <Card
        style={{
          width: 380,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>
            NixaDev Admin
          </Title>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20 }}
          />
        )}

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Введите логин" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Логин"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}