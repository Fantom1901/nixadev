"use client";

import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch } from "antd";

export default function ProjectCreatePage() {
  const { formProps, saveButtonProps } = useForm({
    resource: "admin/projects",
    redirect: "list",
  });

  return (
    <Create saveButtonProps={saveButtonProps} title="Создать проект">
      <Form
        {...formProps}
        layout="vertical"
        initialValues={{
          is_published: true,
          is_featured: false,
          order: 0,
          stack: [],
        }}
      >
        <Form.Item
          label="Название"
          name="title"
          rules={[
            { required: true, message: "Обязательное поле" },
            { max: 150, message: "Максимум 150 символов" },
          ]}
        >
          <Input placeholder="College Flow" />
        </Form.Item>

        <Form.Item
          label="Slug (URL)"
          name="slug"
          rules={[
            { required: true, message: "Обязательное поле" },
            { max: 150, message: "Максимум 150 символов" },
            {
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: "Только строчные латинские буквы, цифры и дефисы (например: college-flow)",
            },
          ]}
        >
          <Input placeholder="college-flow" />
        </Form.Item>

        <Form.Item
          label="Краткое описание (Summary)"
          name="summary"
          rules={[
            { required: true, message: "Обязательное поле" },
            { max: 300, message: "Максимум 300 символов" },
          ]}
        >
          <Input.TextArea rows={2} placeholder="Автоматизация дежурств и расписания" />
        </Form.Item>

        <Form.Item label="Полное описание (Markdown)" name="description">
          <Input.TextArea rows={6} placeholder="Подробности о проекте..." />
        </Form.Item>

        <Form.Item label="Обложка (URL)" name="cover_image">
          <Input placeholder="https://s3.nixadev.ru/covers/college-flow.webp" />
        </Form.Item>

        <Form.Item label="Ссылка на GitHub" name="github_url">
          <Input placeholder="https://github.com/niksa/college-flow" />
        </Form.Item>

        <Form.Item label="Ссылка на Демо" name="demo_url">
          <Input placeholder="https://college-flow.ru" />
        </Form.Item>

        <Form.Item label="Технологический стек" name="stack">
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="Введите тег и нажмите Enter (FastAPI, Next.js, Docker)"
            tokenSeparators={[","]}
          />
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
    </Create>
  );
}