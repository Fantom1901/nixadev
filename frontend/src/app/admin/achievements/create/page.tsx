"use client";

import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";

export default function AchievementCreatePage() {
  const { formProps, saveButtonProps } = useForm({
    resource: "admin/achievements",
    redirect: "list",
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать достижение">
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          is_secret: true,
        }}
      >
        <Form.Item
          label="Slug (уникальный ключ)"
          name="slug"
          rules={[
            { required: true, message: "Обязательное поле" },
            { max: 50, message: "Максимум 50 символов" },
          ]}
        >
          <Input placeholder="konami-code" />
        </Form.Item>

        <Form.Item
          label="Название"
          name="title"
          rules={[
            { required: true, message: "Обязательное поле" },
            { max: 100, message: "Максимум 100 символов" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Описание"
          name="description"
          rules={[{ required: true, message: "Обязательное поле" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Секретное описание (необязательно)" name="secret_description">
          <Input.TextArea rows={2} placeholder="???" />
        </Form.Item>

        <Form.Item
          label="Иконка (название)"
          name="icon"
          rules={[
            { required: true, message: "Обязательное поле" },
            { max: 255, message: "Максимум 255 символов" },
          ]}
        >
          <Input placeholder="terminal" />
        </Form.Item>

        <Form.Item label="Секретная" name="is_secret" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Create>
  );
}