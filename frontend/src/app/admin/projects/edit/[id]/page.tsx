"use client";

import React from "react";
import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch } from "antd";
import { useParams } from "next/navigation";

export default function ProjectEditPage() {
  const params = useParams();
  const id = params?.id as string;

  const { formProps, saveButtonProps } = useForm({
    action: "edit",
    resource: "admin/projects",
    id: id,
    redirect: "list",
  });

  return (
    <Edit saveButtonProps={saveButtonProps} title="Редактировать проект">
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Название"
          name="title"
          rules={[{ max: 150, message: "Максимум 150 символов" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Slug (URL)"
          name="slug"
          rules={[
            { max: 150, message: "Максимум 150 символов" },
            {
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: "Только строчные латинские буквы, цифры и дефисы",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Краткое описание"
          name="summary"
          rules={[{ max: 300, message: "Максимум 300 символов" }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item label="Полное описание (Markdown)" name="description">
          <Input.TextArea rows={6} />
        </Form.Item>

        <Form.Item label="Обложка (URL)" name="cover_image">
          <Input />
        </Form.Item>

        <Form.Item label="Ссылка на GitHub" name="github_url">
          <Input />
        </Form.Item>

        <Form.Item label="Ссылка на Демо" name="demo_url">
          <Input />
        </Form.Item>

        <Form.Item label="Технологический стек" name="stack">
          <Select mode="tags" style={{ width: "100%" }} tokenSeparators={[","]} />
        </Form.Item>

        <Form.Item label="Порядок сортировки" name="order">
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Опубликован" name="is_published" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="В избранном" name="is_featured" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
}