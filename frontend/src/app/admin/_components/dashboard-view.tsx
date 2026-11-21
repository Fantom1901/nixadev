"use client";

import React from "react";
import { useCustom } from "@refinedev/core";
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Button,
  Space,
  Table,
  Progress,
  Tag,
} from "antd";
import {
  FolderOutlined,
  TrophyOutlined,
  PlusOutlined,
  EyeOutlined,
  GithubOutlined,
  GlobalOutlined,
  FireOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const { Title, Text } = Typography;

interface Project {
  id: string;
  title: string;
  slug: string;
  views_count: number;
  github_clicks: number;
  demo_clicks: number;
  is_published: boolean;
  stack?: string[];
}

interface Achievement {
  id: string;
  title: string;
  slug: string;
  total_unlocked_count: number;
  is_secret: boolean;
}

export function DashboardView() {
  const { query: projectsQuery } = useCustom<Project[]>({
    url: "admin/projects",
    method: "get",
  });

  const { query: achievementsQuery } = useCustom<Achievement[]>({
    url: "admin/achievements",
    method: "get",
  });

  const rawProjects = projectsQuery.data?.data ?? projectsQuery.data;
  const rawAchievements = achievementsQuery.data?.data ?? achievementsQuery.data;

  const projects: Project[] = Array.isArray(rawProjects) ? rawProjects : [];
  const achievements: Achievement[] = Array.isArray(rawAchievements)
    ? rawAchievements
    : [];

  // Вычисление ключевых метрик
  const totalViews = projects.reduce((acc, p) => acc + (p.views_count || 0), 0);
  const totalGithubClicks = projects.reduce(
    (acc, p) => acc + (p.github_clicks || 0),
    0
  );
  const totalDemoClicks = projects.reduce(
    (acc, p) => acc + (p.demo_clicks || 0),
    0
  );
  const totalAchievementsUnlocked = achievements.reduce(
    (acc, a) => acc + (a.total_unlocked_count || 0),
    0
  );

  // Данные для диаграммы просмотров и конверсии проектов
  const chartData = projects.map((p) => ({
    name: p.title,
    Просмотры: p.views_count || 0,
    "GitHub клики": p.github_clicks || 0,
    "Demo клики": p.demo_clicks || 0,
  }));

  const isLoading = projectsQuery.isLoading || achievementsQuery.isLoading;

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Панель управления
          </Title>
          <Text type="secondary">Телеметрия вовлечённости и общая статистика</Text>
        </div>

        <Space>
          <Link href="/admin/projects/create">
            <Button type="primary" icon={<PlusOutlined />}>
              Новый проект
            </Button>
          </Link>
          <Link href="/admin/achievements/create">
            <Button icon={<PlusOutlined />}>Новая ачивка</Button>
          </Link>
        </Space>
      </div>

      {/* Верхний ряд: Карточки KPI */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading} bordered={false}>
            <Statistic
              title="Всего просмотров"
              value={totalViews}
              prefix={<EyeOutlined style={{ color: "#1890ff" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              По всем проектам
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading} bordered={false}>
            <Statistic
              title="Переходы на GitHub"
              value={totalGithubClicks}
              prefix={<GithubOutlined style={{ color: "#722ed1" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Кликнули по ссылкам репозиториев
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading} bordered={false}>
            <Statistic
              title="Переходы на Демо"
              value={totalDemoClicks}
              prefix={<GlobalOutlined style={{ color: "#52c41a" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Перешли на живые сайты
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card loading={isLoading} bordered={false}>
            <Statistic
              title="Разблокировано ачивок"
              value={totalAchievementsUnlocked}
              prefix={<FireOutlined style={{ color: "#fa8c16" }} />}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Пасхалок найдено пользователями
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Средний ряд: График просмотров и кликов */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Вовлечённость по проектам"
            loading={isLoading}
            bordered={false}
          >
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                  <YAxis stroke="#888888" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Просмотры" fill="#1890ff" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="GitHub клики"
                    fill="#722ed1"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="Demo клики" fill="#52c41a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Статистика пасхалок/ачивок */}
        <Col xs={24} lg={8}>
          <Card
            title="Популярность пасхалок"
            loading={isLoading}
            bordered={false}
            extra={<Link href="/admin/achievements">Все →</Link>}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {achievements.map((item) => (
                <div key={item.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text strong>
                      {item.title}{" "}
                      {item.is_secret && <Tag color="purple">Секрет</Tag>}
                    </Text>
                    <Text type="secondary">{item.total_unlocked_count} раз</Text>
                  </div>
                  <Progress
                    percent={Math.min(
                      100,
                      Math.round(
                        (item.total_unlocked_count /
                          (totalAchievementsUnlocked || 1)) *
                        100
                      )
                    )}
                    size="small"
                    status="active"
                    strokeColor="#fa8c16"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Нижний ряд: Таблица проектов */}
      <Card
        title="Детализация по проектам"
        loading={isLoading}
        bordered={false}
        extra={<Link href="/admin/projects">Управление →</Link>}
      >
        <Table<Project>
          dataSource={projects}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: "Проект",
              dataIndex: "title",
              key: "title",
              render: (text, record) => (
                <Link href={`/admin/projects/edit/${record.id}`}>
                  <Text strong>{text}</Text>
                </Link>
              ),
            },
            {
              title: "Стек",
              dataIndex: "stack",
              key: "stack",
              render: (stack: string[]) => (
                <>
                  {stack?.map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </>
              ),
            },
            {
              title: "Просмотры",
              dataIndex: "views_count",
              key: "views_count",
              sorter: (a, b) => a.views_count - b.views_count,
            },
            {
              title: "GitHub клики",
              dataIndex: "github_clicks",
              key: "github_clicks",
              sorter: (a, b) => a.github_clicks - b.github_clicks,
            },
            {
              title: "Demo клики",
              dataIndex: "demo_clicks",
              key: "demo_clicks",
              sorter: (a, b) => a.demo_clicks - b.demo_clicks,
            },
            {
              title: "Статус",
              dataIndex: "is_published",
              key: "is_published",
              render: (pub: boolean) => (
                <Tag color={pub ? "green" : "volcano"}>
                  {pub ? "Опубликован" : "Черновик"}
                </Tag>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}