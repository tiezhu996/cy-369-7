import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Tag,
  Space,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
} from "antd";
import {
  CalendarOutlined,
  PlusOutlined,
  UserOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import type {
  Reservation,
  MemberLookupResponse,
  MemberLevelConfig,
} from "../types";
import {
  fetchReservations,
  fetchMemberLevelConfig,
  createReservation,
  lookupMemberByPhone,
} from "../api/client";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;

interface ReservationFormData {
  guestName: string;
  guestPhone: string;
  dateRange: [Dayjs, Dayjs];
  siteType: string;
  originalPrice: number;
}

const SITE_TYPES = [
  { value: "standard", label: "标准营位", price: 299 },
  { value: "deluxe", label: "豪华营位", price: 499 },
  { value: "family", label: "家庭营位", price: 699 },
  { value: "vip", label: "VIP营位", price: 999 },
];

function getLevelTagColor(level: string): string {
  const colorMap: Record<string, string> = {
    NORMAL: "default",
    SILVER: "blue",
    GOLD: "gold",
  };
  return colorMap[level] || "default";
}

export function ReservationTable() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [levelConfig, setLevelConfig] = useState<MemberLevelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [memberLookup, setMemberLookup] = useState<MemberLookupResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [form] = Form.useForm<ReservationFormData>();
  const [selectedSiteType, setSelectedSiteType] = useState<string>("standard");

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservationsData, configData] = await Promise.all([
        fetchReservations(),
        fetchMemberLevelConfig(),
      ]);
      setReservations(reservationsData);
      setLevelConfig(configData);
    } catch {
      message.error("加载预约数据失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const debouncedLookup = useCallback(
    (() => {
      let timeoutId: number;
      return (phone: string) => {
        window.clearTimeout(timeoutId);
        if (phone.length === 11 && /^1[3-9]\d{9}$/.test(phone)) {
          setLookupLoading(true);
          timeoutId = window.setTimeout(async () => {
            try {
              const result = await lookupMemberByPhone(phone);
              setMemberLookup(result);
            } catch {
              setMemberLookup(null);
            } finally {
              setLookupLoading(false);
            }
          }, 500);
        } else {
          setMemberLookup(null);
        }
      };
    })(),
    [],
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedLookup(e.target.value);
  };

  const handleSiteTypeChange = (value: string) => {
    setSelectedSiteType(value);
    const site = SITE_TYPES.find((s) => s.value === value);
    if (site) {
      form.setFieldsValue({ originalPrice: site.price });
    }
  };

  const handleAdd = () => {
    setMemberLookup(null);
    setSelectedSiteType("standard");
    form.resetFields();
    form.setFieldsValue({ originalPrice: SITE_TYPES[0].price });
    setModalVisible(true);
  };

  const calculatePrice = () => {
    const originalPrice = form.getFieldValue("originalPrice") || 0;
    const discountRate = memberLookup?.member?.discountRate || 1;
    return {
      original: originalPrice,
      discount: discountRate,
      final: Number((originalPrice * discountRate).toFixed(2)),
      saved: Number((originalPrice * (1 - discountRate)).toFixed(2)),
    };
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [checkinDate, checkoutDate] = values.dateRange;
      const prices = calculatePrice();

      await createReservation({
        guestName: values.guestName,
        guestPhone: values.guestPhone,
        checkinDate: checkinDate.format("YYYY-MM-DD"),
        checkoutDate: checkoutDate.format("YYYY-MM-DD"),
        siteType: values.siteType,
        originalPrice: prices.original,
      });

      message.success(
        memberLookup?.exists
          ? `预约成功！已识别${memberLookup.member?.levelLabel}，优惠${prices.saved}元`
          : "预约成功！已自动创建会员档案",
      );
      setModalVisible(false);
      loadData();
    } catch {
      // Validation errors handled by form
    }
  };

  const columns: ColumnsType<Reservation> = [
    {
      title: "入住人",
      dataIndex: "guestName",
      key: "guestName",
      width: 100,
    },
    {
      title: "手机号",
      dataIndex: "guestPhone",
      key: "guestPhone",
      width: 130,
    },
    {
      title: "会员等级",
      dataIndex: "memberLevel",
      key: "memberLevel",
      width: 120,
      render: (value: string | null, record: Reservation) =>
        value ? (
          <Space>
            <Tag color={getLevelTagColor(value)}>
              {record.memberLevelLabel}
            </Tag>
            {record.isNewMember && <Tag color="green">新会员</Tag>}
          </Space>
        ) : (
          <Text type="secondary">非会员</Text>
        ),
    },
    {
      title: "入离日期",
      key: "dates",
      width: 220,
      render: (_: unknown, record: Reservation) => (
        <Space direction="vertical" size={0}>
          <Text>入住: {record.checkinDate}</Text>
          <Text>离店: {record.checkoutDate}</Text>
        </Space>
      ),
    },
    {
      title: "营位类型",
      dataIndex: "siteType",
      key: "siteType",
      width: 100,
      render: (value: string) =>
        SITE_TYPES.find((s) => s.value === value)?.label || value,
    },
    {
      title: "价格明细",
      key: "price",
      width: 180,
      render: (_: unknown, record: Reservation) => (
        <Space direction="vertical" size={0}>
          <Text delete type="secondary">
            原价 ¥{record.originalPrice}
          </Text>
          <Text strong type={record.discountRate < 1 ? "success" : undefined}>
            会员价 ¥{record.finalPrice}
            {record.discountRate < 1 &&
              ` (${(record.discountRate * 100).toFixed(0)}%)`}
          </Text>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value: string) => <Tag color="green">{value}</Tag>,
    },
  ];

  const stats = {
    total: reservations.length,
    member: reservations.filter((r) => r.memberId !== null).length,
    newMember: reservations.filter((r) => r.isNewMember).length,
    totalRevenue: reservations.reduce((sum, r) => sum + r.finalPrice, 0),
  };

  const pricePreview = calculatePrice();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="预约总数"
              value={stats.total}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="会员预约"
              value={stats.member}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="新增会员"
              value={stats.newMember}
              prefix={<GiftOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="营收总额"
              value={stats.totalRevenue}
              precision={2}
              prefix="¥"
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          新增预约
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={reservations}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        scroll={{ x: 950 }}
      />

      <Modal
        title="新增预约"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确认预约"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="guestName"
            label="入住人姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          >
            <Input placeholder="请输入入住人姓名" />
          </Form.Item>

          <Form.Item
            name="guestPhone"
            label="手机号"
            rules={[
              { required: true, message: "请输入手机号" },
              { pattern: /^1[3-9]\d{9}$/, message: "请输入有效的手机号" },
            ]}
          >
            <Input
              placeholder="请输入手机号，自动识别会员等级"
              onChange={handlePhoneChange}
              maxLength={11}
            />
          </Form.Item>

          {memberLookup && (
            <div style={{ marginBottom: 16 }}>
              {memberLookup.exists ? (
                <Alert
                  icon={<CheckCircleOutlined />}
                  type="success"
                  showIcon
                  message={
                    <Space direction="vertical" size={4}>
                      <Space>
                        <Tag color={getLevelTagColor(memberLookup.member!.level)}>
                          {memberLookup.member!.levelLabel}
                        </Tag>
                        <Text strong>{memberLookup.member!.name}</Text>
                      </Space>
                      <Text type="secondary">
                        已入住 {memberLookup.member!.stayCount} 次 · 折扣{" "}
                        {(memberLookup.member!.discountRate * 100).toFixed(0)}%
                      </Text>
                      {memberLookup.member!.nextLevel && (
                        <Text type="success">
                          再住 {memberLookup.member!.staysToNextLevel} 次即可升级为{" "}
                          {memberLookup.member!.nextLevel}
                        </Text>
                      )}
                    </Space>
                  }
                />
              ) : (
                <Alert
                  icon={<InfoCircleOutlined />}
                  type="info"
                  showIcon
                  message="新客户预约，将自动创建普通会员档案"
                />
              )}
            </div>
          )}

          {lookupLoading && (
            <div style={{ marginBottom: 16 }}>
              <Alert type="info" showIcon message="正在识别会员信息..." />
            </div>
          )}

          <Form.Item
            name="dateRange"
            label="入离日期"
            rules={[{ required: true, message: "请选择日期" }]}
          >
            <RangePicker
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              placeholder={["入住日期", "离店日期"]}
            />
          </Form.Item>

          <Form.Item
            name="siteType"
            label="营位类型"
            rules={[{ required: true, message: "请选择营位类型" }]}
          >
            <Select
              placeholder="请选择营位类型"
              onChange={handleSiteTypeChange}
            >
              {SITE_TYPES.map((site) => (
                <Option key={site.value} value={site.value}>
                  {site.label} - ¥{site.price}/晚
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="originalPrice"
            label="原价"
            rules={[{ required: true, message: "请输入原价" }]}
          >
            <InputNumber
              min={0}
              step={1}
              style={{ width: "100%" }}
              prefix="¥"
              placeholder="营位原价"
            />
          </Form.Item>

          {form.getFieldValue("originalPrice") > 0 && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={5} style={{ margin: 0 }}>
                  价格预览
                </Title>
                <Row gutter={16}>
                  <Col span={8}>
                    <Text type="secondary">原价</Text>
                    <div>
                      <Text delete>¥{pricePreview.original.toFixed(2)}</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">折扣</Text>
                    <div>
                      <Text strong>{(pricePreview.discount * 100).toFixed(0)}%</Text>
                    </div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary">实付</Text>
                    <div>
                      <Text strong style={{ color: "#b14f3b", fontSize: 18 }}>
                        ¥{pricePreview.final.toFixed(2)}
                      </Text>
                    </div>
                  </Col>
                </Row>
                {pricePreview.saved > 0 && (
                  <Text type="success">
                    <GiftOutlined /> 会员优惠已省 ¥{pricePreview.saved.toFixed(2)}
                  </Text>
                )}
              </Space>
            </Card>
          )}
        </Form>
      </Modal>
    </div>
  );
}
