"use client";

import React from "react";
import {
  List,
  useTable,
  EditButton,
  DeleteButton,
  TagField,
} from "@refinedev/antd";
import { Table, Space } from "antd";

export default function AchievementsListPage() {
  const { tableProps } = useTable({
    resource: "admin/achievements",
    syncWithLocation: true,
  });

  return (
    <List title="Достижения">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="title" title="Название" />
        <Table.Column dataIndex="description" title="Описание" />
        <Table.Column dataIndex="category" title="Категория" />
        <Table.Column
          dataIndex="is_unlocked"
          title="Разблокировано"
          render={(value: boolean) => (
            <TagField
              value={value ? "Да" : "Нет"}
              color={value ? "green" : "red"}
            />
          )}
        />
        <Table.Column
          title="Действия"
          dataIndex="actions"
          render={(_, record: { id: number | string }) => (
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