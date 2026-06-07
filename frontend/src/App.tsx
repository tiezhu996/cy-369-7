import { useEffect, useState, useCallback } from "react";
import {
  Button,
  ConfigProvider,
  Layout,
  Typography,
  theme,
  Menu,
  Tag,
} from "antd";
import {
  ApiOutlined,
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate, Routes, Route } from "react-router-dom";
import { fetchOverview } from "./api/client";
import { APP_CODE, APP_NAME, APP_THEME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse } from "./types";
import { FeatureStrip } from "./components/FeatureStrip";
import { MetricGrid } from "./components/MetricGrid";
import { OperationsTable } from "./components/OperationsTable";
import { MemberTable } from "./components/MemberTable";
import { ReservationTable } from "./components/ReservationTable";
import { routes } from "./routes";

const { Header, Content, Sider } = Layout;

const menuItems = [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: "运营总览",
  },
  {
    key: "/members",
    icon: <TeamOutlined />,
    label: "会员管理",
    tag: <Tag color="gold">新</Tag>,
  },
  {
    key: "/reservations",
    icon: <CalendarOutlined />,
    label: "预约管理",
    tag: <Tag color="gold">新</Tag>,
  },
  {
    key: "/resources",
    icon: <AppstoreOutlined />,
    label: "资源管理",
  },
  {
    key: "/analytics",
    icon: <BarChartOutlined />,
    label: "数据分析",
  },
];

function DashboardPage() {
  const [overview, setOverview] = useState<OverviewResponse>(
    createFallbackOverview(),
  );
  const [notice, setNotice] = useState(REQUEST_MESSAGES.overviewFallback);

  useEffect(() => {
    fetchOverview()
      .then((payload) => {
        setOverview(payload);
        setNotice("后端服务已联通，当前展示实时接口数据。");
      })
      .catch(() => setNotice(REQUEST_MESSAGES.overviewFallback));
  }, []);

  return (
    <>
      <section className="lead-grid">
        <article className="hero-panel">
          <span className="pill">{notice}</span>
          <Typography.Title level={2}>{overview.appName}</Typography.Title>
          <p>{overview.description}</p>
        </article>
        <MetricGrid items={overview.kpis} />
      </section>
      <FeatureStrip items={overview.features} />
      <section className="work-panel">
        <Typography.Title level={3}>运营任务流</Typography.Title>
        <OperationsTable records={overview.records} />
      </section>
    </>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="work-panel">
      <Typography.Title level={3}>{title}</Typography.Title>
      <p style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
        该功能模块开发中...
      </p>
    </section>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      navigate(key);
    },
    [navigate],
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: APP_THEME.accent,
          colorText: APP_THEME.ink,
          colorBgBase: APP_THEME.paper,
          borderRadius: 8,
        },
      }}
    >
      <Layout className="app-shell" style={{ minHeight: "100vh" }}>
        <Header className="topbar">
          <div className="brand-block">
            <span className="brand-code">{APP_CODE}</span>
            <h1 className="brand-title">{APP_NAME}</h1>
          </div>
          <Button
            type="primary"
            icon={<ApiOutlined />}
            href={REQUEST_MESSAGES.healthPath}
          >
            API Health
          </Button>
        </Header>
        <Layout>
          <Sider
            width={220}
            style={{
              background: APP_THEME.surface,
              paddingTop: 16,
            }}
            theme="light"
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{
                background: "transparent",
                borderRight: "none",
              }}
            />
          </Sider>
          <Content className="workspace">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/members" element={<MemberTable />} />
              <Route path="/reservations" element={<ReservationTable />} />
              <Route
                path="/resources"
                element={<PlaceholderPage title="资源管理" />}
              />
              <Route
                path="/analytics"
                element={<PlaceholderPage title="数据分析" />}
              />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
