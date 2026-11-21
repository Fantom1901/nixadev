"use client";

import React from "react";
import {
  List,
  useTable,
  EditButton,
  DeleteButton,
  TagField,
} from "@refinedev/antd";
import { Table, Space, Tag } from "antd";
import { ProjectAdmin } from "@/types";

export default function ProjectsListPage() {
  const { tableProps } = useTable<ProjectAdmin>({
    resource: "admin/projects",
    syncWithLocation: true,
  });

  return (
    <List title="Управление проектами">
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="title"
          title="Название"
          render={(value: string, record: ProjectAdmin) => (
            <Space>
              <strong>{value}</strong>
              {record.is_featured && <Tag color="gold">Featured</Tag>}
            </Space>
          )}
        />
        <Table.Column dataIndex="slug" title="Slug" />
        <Table.Column
          dataIndex="is_published"
          title="Статус"
          render={(value: boolean) => (
            <TagField
              value={value ? "Опубликован" : "Черновик"}
              color={value ? "green" : "default"}
            />
          )}
        />
        <Table.Column dataIndex="views_count" title="Просмотры" />
        <Table.Column
          title="Клики (GH / Demo)"
          render={(_, record: ProjectAdmin) =>
            `${record.github_clicks} / ${record.demo_clicks}`
          }
        />
        <Table.Column
          title="Действия"
          dataIndex="actions"
          render={(_, record: ProjectAdmin) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
}