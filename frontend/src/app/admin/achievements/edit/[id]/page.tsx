"use client";

import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { useRouter, useParams } from "next/navigation";
import { Form, Input, Switch } from "antd";

export default function AchievementEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { formProps, saveButtonProps } = useForm({
    action: "edit",
    resource: "admin/achievements",
    id: id,
    redirect: "list",
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактировать достижение">
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Название"
          name="title"
          rules={[{ max: 100, message: "Максимум 100 символов" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Описание" name="description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item label="Секретное описание" name="secret_description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item
          label="Иконка"
          name="icon"
          rules={[{ max: 255, message: "Максимум 255 символов" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Секретная" name="is_secret" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
}