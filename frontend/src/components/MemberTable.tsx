import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  Space,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  CrownOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Member, MemberLevel, MemberLevelConfig } from "../types";
import {
  fetchMembers,
  fetchMemberLevelConfig,
  createMember,
  updateMember,
  deleteMember,
} from "../api/client";

const { Option } = Select;

interface MemberFormData {
  name: string;
  phone: string;
  level?: MemberLevel;
  stayCount?: number;
}

function getLevelTagColor(level: string): string {
  const colorMap: Record<string, string> = {
    NORMAL: "default",
    SILVER: "blue",
    GOLD: "gold",
  };
  return colorMap[level] || "default";
}

export function MemberTable() {
  const [members, setMembers] = useState<Member[]>([]);
  const [levelConfig, setLevelConfig] = useState<MemberLevelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form] = Form.useForm<MemberFormData>();

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersData, configData] = await Promise.all([
        fetchMembers(),
        fetchMemberLevelConfig(),
      ]);
      setMembers(membersData);
      setLevelConfig(configData);
    } catch {
      message.error("加载会员数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setEditingMember(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    form.setFieldsValue({
      name: member.name,
      phone: member.phone,
      level: member.level,
      stayCount: member.stayCount,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMember(id);
      message.success("删除成功");
      loadData();
    } catch {
      message.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingMember) {
        await updateMember(editingMember.id, values);
        message.success("更新成功");
      } else {
        await createMember(values);
        message.success("创建成功");
      }
      setModalVisible(false);
      loadData();
    } catch {
      // Validation errors handled by form
    }
  };

  const columns: ColumnsType<Member> = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
      width: 120,
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
      width: 140,
    },
    {
      title: "会员等级",
      dataIndex: "level",
      key: "level",
      width: 120,
      render: (value: string, record: Member) => (
        <Tag color={getLevelTagColor(value)}>{record.levelLabel}</Tag>
      ),
    },
    {
      title: "入住次数",
      dataIndex: "stayCount",
      key: "stayCount",
      width: 100,
      render: (value: number) => `${value} 次`,
    },
    {
      title: "折扣率",
      dataIndex: "discountRate",
      key: "discountRate",
      width: 100,
      render: (value: number) => `${(value * 100).toFixed(0)}%`,
    },
    {
      title: "注册时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => new Date(value).toLocaleString("zh-CN"),
    },
    {
      title: "操作",
      key: "actions",
      width: 150,
      render: (_: unknown, record: Member) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该会员？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: members.length,
    gold: members.filter((m) => m.level === "GOLD").length,
    silver: members.filter((m) => m.level === "SILVER").length,
    normal: members.filter((m) => m.level === "NORMAL").length,
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="会员总数"
              value={stats.total}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="金卡会员"
              value={stats.gold}
              valueStyle={{ color: "#d4af37" }}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="银卡会员"
              value={stats.silver}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CrownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="普通会员"
              value={stats.normal}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {levelConfig.map((config) => (
          <Col xs={24} md={8} key={config.level}>
            <Card size="small">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                  <Tag color={config.color}>{config.label}</Tag>
                  <span>
                    折扣 <strong>{(config.discountRate * 100).toFixed(0)}%</strong>
                  </span>
                </Space>
                <small style={{ color: "#888" }}>
                  入住满 {config.minStayCount} 次自动升级
                </small>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleAdd}
        >
          添加会员
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingMember ? "编辑会员" : "添加会员"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="请输入姓名" maxLength={80} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: "请输入手机号" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={20} />
          </Form.Item>
          <Form.Item name="level" label="会员等级">
            <Select placeholder="自动按入住次数计算" allowClear>
              {levelConfig.map((config) => (
                <Option key={config.level} value={config.level}>
                  {config.label} ({(config.discountRate * 100).toFixed(0)}%折扣)
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="stayCount" label="入住次数">
            <InputNumber
              min={0}
              placeholder="默认为0"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
