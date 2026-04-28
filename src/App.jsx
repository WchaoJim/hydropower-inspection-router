import React, { useMemo, useState } from 'react'
import { HashRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'

const NAV = [
  { path: '/dashboard', label: '首页驾驶舱', icon: '⌂' },
  { path: '/robot', label: '机器狗巡检', icon: '🐕' },
  { path: '/drone', label: '无人机巡检', icon: '✈' },
  { path: '/alarm', label: '缺陷与报警', icon: '⚠', badge: 7 },
  { path: '/report', label: '巡检报告', icon: '▣' },
  { path: '/settings', label: '系统设置', icon: '⚙' },
]

const floorRows = [
  ['1F水泵房', 100, '已完成', '10:18'],
  ['2F油压装置', 100, '已完成', '10:15'],
  ['3F机组层', 78, '巡检中', '10:28'],
  ['4F中控通道', 65, '巡检中', '10:25'],
  ['5F电缆夹层', 30, '巡检中', '10:22'],
  ['6F配电室', 0, '待开始', '--'],
]

const robotRows = [
  ['R-01', '6F配电室', '82%', '巡检中', '▮▮▮▮', '10:30:21'],
  ['R-02', '5F电缆夹层', '76%', '巡检中', '▮▮▮▮', '10:30:19'],
  ['R-03', '4F中控通道', '68%', '巡检中', '▮▮▮', '10:30:18'],
  ['R-04', '3F机组层', '61%', '巡检中', '▮▮▮', '10:30:17'],
  ['R-05', '1F水泵房', '54%', '巡检中', '▮▮▮', '10:30:16'],
  ['R-06', '1F水泵房（待命区）', '46%', '待命中', '▮▮▮', '10:30:15'],
]

function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}

function Shell() {
  const [activeName, setActiveName] = useState(() => localStorage.getItem('hydropowerStationName') || '某某水电站智能巡检平台')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(activeName)

  const saveName = () => {
    const next = draft.trim() || '某某水电站智能巡检平台'
    setActiveName(next)
    setDraft(next)
    localStorage.setItem('hydropowerStationName', next)
    setEditing(false)
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">💧</div>
          <div className="brand-name">
            {editing ? (
              <input
                value={draft}
                autoFocus
                onChange={(event) => setDraft(event.target.value)}
                onBlur={saveName}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveName()
                  if (event.key === 'Escape') {
                    setDraft(activeName)
                    setEditing(false)
                  }
                }}
              />
            ) : (
              <div className="brand-read">
                <strong>{activeName}</strong>
                <button onClick={() => setEditing(true)} title="编辑平台名称">✎</button>
              </div>
            )}
          </div>
        </div>

        <nav className="nav">
          {NAV.map(item => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge ? <em>{item.badge}</em> : null}
            </NavLink>
          ))}
        </nav>

        <button className="collapse-btn">« 收起菜单</button>
      </aside>

      <main className="main">
        <TopBar />
        <section className="page">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/robot" element={<RobotPage />} />
            <Route path="/drone" element={<DronePage />} />
            <Route path="/alarm" element={<AlarmPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </section>
      </main>
    </div>
  )
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="tech-line left" />
      <h1>水电站智能巡检系统界面原型</h1>
      <div className="tech-line right" />
      <div className="topbar-info">
        <span>⛅ 20°C 多云</span>
        <span>📅 2025-05-20&nbsp;&nbsp;10:30:45</span>
        <span>👤 管理员⌄</span>
      </div>
    </header>
  )
}

function Panel({ title, extra, children, className = '' }) {
  return (
    <section className={`panel ${className}`.trim()}>
      <div className="panel-title">
        <strong>{title}</strong>
        {extra}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  )
}

function MetricCard({ icon, label, value, sub, danger }) {
  return (
    <div className={`metric-card ${danger ? 'danger' : ''}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-main">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {sub ? <small>{sub}</small> : null}
    </div>
  )
}

function DataTable({ heads, rows, render }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>{heads.map(head => <th key={head}>{head}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => <tr key={index}>{render(row, index)}</tr>)}
        </tbody>
      </table>
    </div>
  )
}

function Status({ value }) {
  const type = value.includes('完成') || value.includes('在线') || value.includes('已处理') || value.includes('已生成')
    ? 'ok'
    : value.includes('待')
      ? 'wait'
      : value.includes('中') || value.includes('执行')
        ? 'run'
        : 'bad'
  return <span className={`status ${type}`}>● {value}</span>
}

function Progress({ value }) {
  return <div className="progress"><span style={{ width: `${value}%` }} /></div>
}

function DashboardPage() {
  return (
    <div className="grid">
      <div className="metrics span-12">
        <MetricCard icon="🐕" label="机器狗总数" value="6台" sub="● 6/6" />
        <MetricCard icon="🚁" label="无人机总数" value="2台" sub="● 2/2" />
        <MetricCard icon="📋" label="今日巡检任务" value="28项" />
        <MetricCard icon="△" label="异常发现" value="7项" sub="高优先级" danger />
      </div>

      <Panel title="厂房六层机器狗巡检" className="span-4">
        <DataTable
          heads={['楼层', '巡检进度', '状态', '更新时间']}
          rows={floorRows}
          render={(row) => (
            <>
              <td>{row[0]}</td>
              <td><div className="progress-cell"><Progress value={row[1]} /><span>{row[1]}%</span></div></td>
              <td><Status value={row[2]} /></td>
              <td>{row[3]}</td>
            </>
          )}
        />
      </Panel>

      <Panel title="水库大坝无人机巡检" className="span-4" extra={<span className="pill ok">巡检中</span>}>
        <DamMap compact />
        <div className="mini-row">
          <MiniStat label="航线" value="航线A-03" />
          <MiniStat label="当前高度" value="86m" />
          <MiniStat label="速度" value="8.2m/s" />
          <MiniStat label="已采集" value="126张" />
        </div>
      </Panel>

      <Panel title="AI异常识别" className="span-4" extra={<span className="more">更多 ›</span>}>
        <DataTable
          heads={['异常类型', '位置', 'AI置信度', '状态', '发现时间']}
          rows={[
            ['渗漏疑似', '3F机组层-#2机组', '92%', '未处理', '10:24'],
            ['仪表读数异常', '2F油压装置-压力表', '88%', '未处理', '10:21'],
            ['锈蚀识别', '5F电缆夹层-支架', '85%', '未处理', '10:19'],
            ['温度异常', '4F中控通道-配电柜', '83%', '处理中', '10:17'],
            ['渗漏疑似', '1F水泵房-伸缩缝', '77%', '已处理', '09:58'],
          ]}
          render={(row) => (
            <>
              {row.map((item, index) => <td key={index}>{index === 3 ? <Status value={item} /> : item}</td>)}
            </>
          )}
        />
      </Panel>

      <Panel title="巡检趋势" className="span-6">
        <Chart option={barLineOption()} />
      </Panel>
      <Panel title="厂房楼层温度趋势" className="span-6">
        <Chart option={lineOption()} />
      </Panel>
    </div>
  )
}

function RobotPage() {
  return (
    <div className="grid">
      <div className="metrics span-12">
        <MetricCard icon="🐕" label="机器狗总数" value="6台" sub="6/6" />
        <MetricCard icon="♜" label="执行中" value="4台" />
        <MetricCard icon="⌁" label="待命中" value="2台" />
        <MetricCard icon="📍" label="今日巡检点位" value="128个" sub="里程 12.6km" />
      </div>

      <Panel title="机器狗巡检总览（厂房六层）" className="span-6">
        <FloorView />
      </Panel>

      <div className="span-6 subgrid">
        <Panel title="实时视频（R-01 · 6F 配电室）" className="sub-4" extra={<span className="pill ok">直播中</span>}>
          <div className="video room"><b>🐕</b></div>
        </Panel>
        <Panel title="红外热成像（异常点）" className="sub-2">
          <div className="thermal"><b>58.6°C</b><span>位置：6F配电柜-2#断路器</span></div>
        </Panel>
        <Panel title="机器狗队列状态" className="sub-6">
          <DataTable
            heads={['编号', '当前楼层', '电量', '任务状态', '信号强度', '最后更新时间']}
            rows={robotRows}
            render={(row) => <>{row.map((item, index) => <td key={index}>{index === 3 ? <Status value={item} /> : item}</td>)}</>}
          />
        </Panel>
      </div>

      <Panel title="巡检任务与点位" className="span-7">
        <DataTable
          heads={['楼层', '巡检点位', '点位类型', '计划频次', '今日状态', '异常数量']}
          rows={[
            ['1F水泵房', '水泵机组、阀门、管道', '设备点位', '2次/天', '已完成', 0],
            ['2F油压装置', '油压站、蓄能器、阀组', '设备点位', '2次/天', '已完成', 0],
            ['3F机组层', '发电机组、定子、转子', '设备点位', '2次/天', '进行中', 1],
            ['4F中控通道', '控制柜、通信柜、照明', '环境点位', '2次/天', '进行中', 0],
            ['5F电缆夹层', '电缆桥架、接头、支架', '设备点位', '1次/天', '进行中', 0],
            ['6F配电室', '配电柜、断路器、母线', '设备点位', '2次/天', '进行中', 1],
          ]}
          render={(row) => <>{row.map((item, index) => <td key={index}>{index === 4 ? <Status value={item} /> : item}</td>)}</>}
        />
      </Panel>

      <Panel title="机器狗巡检电量趋势（今日）" className="span-5">
        <Chart option={batteryOption()} />
        <div className="warning-box">⚠ R-06 电量 46%　　⚠ R-05 电量 54%</div>
      </Panel>
    </div>
  )
}

function DronePage() {
  return (
    <div className="grid">
      <div className="metrics five span-12">
        <MetricCard icon="🚁" label="无人机总数" value="2台" sub="2/2" />
        <MetricCard icon="📶" label="在线状态" value="2/2" />
        <MetricCard icon="📋" label="飞行任务" value="2个" />
        <MetricCard icon="🖼" label="今日采集影像" value="268张" />
        <MetricCard icon="◷" label="今日飞行时长" value="1h 38m" />
      </div>

      <Panel title="水库大坝无人机巡检" className="span-7">
        <DamMap />
      </Panel>

      <Panel title="当前无人机状态" className="span-5" extra={<span className="select-small">D-01⌄</span>}>
        <div className="status-grid">
          {[
            ['飞行高度', '86m'],
            ['飞行速度', '8.2m/s'],
            ['电池电量', '76%'],
            ['信号强度', '强'],
            ['风速', '4.6m/s'],
            ['云台角度', '-12°/5°'],
            ['相机模式', '自动拍照'],
            ['存储空间', '62%'],
          ].map(([label, value]) => <MiniStat key={label} label={label} value={value} />)}
        </div>
      </Panel>

      <Panel title="飞行任务列表" className="span-4">
        <DataTable
          heads={['任务编号', '航线', '状态', '进度']}
          rows={[
            ['TASK-20250520-01', 'D-01航线', '执行中', 68],
            ['TASK-20250520-02', 'D-02航线', '执行中', 41],
          ]}
          render={(row) => (
            <>
              <td>{row[0]}</td><td>{row[1]}</td><td><Status value={row[2]} /></td><td><Progress value={row[3]} /></td>
            </>
          )}
        />
      </Panel>

      <Panel title="实时影像（D-01）" className="span-4">
        <div className="video dam">REC</div>
      </Panel>

      <Panel title="缺陷识别结果（D-01）" className="span-4">
        <div className="defects">
          {[
            ['裂缝识别', '高', '92%'],
            ['渗漏疑似', '中', '88%'],
            ['异物识别', '低', '75%'],
            ['坡面异常', '中', '82%'],
          ].map((item, index) => (
            <div className="defect" key={item[0]}>
              <div />
              <p><b>{item[0]}</b><span>位置：坝体右岸 0+{125 + index * 60}</span><span>置信度：{item[2]}</span></p>
              <em>{item[1]}</em>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="飞行与影像采集趋势" className="span-6"><Chart option={barLineOption()} /></Panel>
      <Panel title="任务统计（近7天）" className="span-3"><Chart option={donutOption('12个')} /></Panel>
      <Panel title="数据统计（近7天）" className="span-3">
        <div className="stat-list"><p>飞行总时长 <b>9h 46m</b></p><p>采集影像总数 <b>1628张</b></p><p>识别缺陷总数 <b>23项</b></p></div>
      </Panel>
    </div>
  )
}

function AlarmPage() {
  const rows = [
    ['AL250520-001', '渗漏疑似', '渗漏相机', '大坝-右岸廊道', '92%', '高风险', '待派单', '--', '2025-05-20 10:24'],
    ['AL250520-002', '温度异常', '温度传感器', '3#机组轴承座', '88%', '高风险', '处理中', '张伟', '2025-05-20 10:17'],
    ['AL250520-003', '仪表读数异常', '监控系统', '2#压力表', '85%', '中风险', '待派单', '--', '2025-05-20 09:58'],
    ['AL250520-004', '锈蚀识别', 'AI视觉识别', '5#闸门支座', '80%', '中风险', '已处理', '李强', '2025-05-20 09:41'],
    ['AL250520-005', '渗漏疑似', '渗漏相机', '厂房尾水洞', '77%', '中风险', '处理中', '王磊', '2025-05-20 09:12'],
  ]
  return (
    <div className="grid">
      <div className="metrics five span-12">
        <MetricCard icon="🔔" label="总报警数" value="128项" sub="较昨日 ↑18" danger />
        <MetricCard icon="△" label="高风险" value="7项" sub="较昨日 ↑2" danger />
        <MetricCard icon="!" label="中风险" value="32项" />
        <MetricCard icon="✓" label="已处理" value="89项" />
        <MetricCard icon="▤" label="待派单" value="21项" />
      </div>
      <div className="filters span-12">
        <span>类型 全部⌄</span><span>等级 全部⌄</span><span>状态 全部⌄</span><span>来源设备 全部⌄</span><span>2025-05-13 ~ 2025-05-20</span><input placeholder="请输入关键词" /><button>重置</button>
      </div>
      <Panel title="缺陷与报警中心" className="span-8">
        <DataTable heads={['编号', '异常类型', '来源', '位置', 'AI置信度', '等级', '状态', '责任人', '发现时间']} rows={rows} render={(row) => <>{row.map((item, index) => <td key={index}>{index === 6 ? <Status value={item} /> : item}</td>)}</>} />
      </Panel>
      <Panel title="告警详情｜AL250520-001" className="span-4">
        <div className="alarm-images"><div className="leak big" /><div className="leak" /><div className="leak" /></div>
        <p className="desc">异常描述：右岸廊道渗漏量较大，水流沿廊道壁面流淌，局部伴有白色析出物。</p>
        <div className="steps"><span>待派单</span><span>已派单</span><span>处理中</span><span>待验收</span><span>已关闭</span></div>
      </Panel>
      <Panel title="报警趋势（近7天）" className="span-6"><Chart option={alarmTrendOption()} /></Panel>
      <Panel title="报警分布（按类型）" className="span-6"><Chart option={donutOption('128')} /></Panel>
    </div>
  )
}

function ReportPage() {
  const reportList = ['日报', '周报', '月报', '机器狗巡检报告', '无人机巡检报告', 'AI异常汇总报告', '缺陷处理报告', '设备健康评估报告']
  return (
    <div className="grid">
      <div className="toolbar span-12"><button>生成报告</button><button>导出PDF</button><button>导出Word</button><button>下载附件</button><span>日期筛选　2025-05-01　至　2025-05-20</span></div>
      <Panel title="报告列表" className="span-3">
        <div className="report-list">{reportList.map((item, index) => <div className={index === 3 ? 'selected' : ''} key={item}><b>{item}</b><span>{index === 2 ? '生成中' : index === 6 ? '已审批' : '已生成'}</span></div>)}</div>
      </Panel>
      <Panel title="报告预览" className="span-6">
        <div className="paper">
          <h2>机器狗巡检日报</h2>
          <h3>2025年05月20日</h3>
          <p><b>报告摘要</b></p>
          <p>本报告基于机器狗巡检数据，覆盖大坝、厂房、引水系统、开关站等关键区域。今日巡检任务已全部完成，发现异常7项，均已闭环或处理中。</p>
          <div className="paper-kpis">{[['巡检任务数', '28项'], ['巡检点位数', '126个'], ['巡检里程', '8.6km'], ['异常发现数', '7项'], ['缺陷闭环率', '85%']].map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div>
          <div className="paper-images">{['大坝坝体', '厂房设备区', '引水系统', '开关站', '库区边坡'].map(item => <div key={item}><i /><b>{item}</b><span>93%</span></div>)}</div>
        </div>
      </Panel>
      <Panel title="报告信息 / 审批流程" className="span-3">
        <div className="kv"><p>报告名称：机器狗巡检日报</p><p>报告类型：日报</p><p>生成时间：2025-05-20 08:30:12</p><p>生成人员：系统自动生成</p><p>责任人：张三</p><p>附件数量：32个</p></div>
        <div className="steps vertical"><span>已提交</span><span>已审核</span><span>待审批</span><span>未归档</span></div>
      </Panel>
      <Panel title="报告生成统计（按月）" className="span-4"><Chart option={reportBarOption()} /></Panel>
      <Panel title="异常问题闭环率趋势" className="span-4"><Chart option={closeRateOption()} /></Panel>
      <Panel title="导出 / 下载记录" className="span-4"><DataTable heads={['时间', '类型', '格式', '大小', '操作人']} rows={[['2025-05-20', '导出报告', 'PDF', '2.48MB', '张三'], ['2025-05-19', '导出报告', 'WORD', '1.93MB', '李四'], ['2025-05-19', '下载附件', 'ZIP', '523MB', '赵六']]} render={(row) => <>{row.map(item => <td key={item}>{item}</td>)}</>} /></Panel>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="grid">
      <div className="setting-cards span-12">{['用户与角色', '设备接入', '巡检点位配置', '巡检任务模板', 'AI识别阈值', '报警规则', '通知方式', '数据存储与备份'].map(item => <button key={item}><b>{item === 'AI识别阈值' ? 'AI' : '⬢'}</b><span>{item}</span></button>)}</div>
      <div className="setting-menu span-2">{['系统配置概览', '巡检参数配置', '告警配置', '权限与安全', '数据与存储', '系统维护', '日志与审计'].map((item, index) => <button className={index === 0 ? 'on' : ''} key={item}>{item}</button>)}</div>
      <Panel title="系统参数配置" className="span-3">
        <div className="form">
          <label>默认巡检周期<select><option>每日 08:00</option></select></label>
          <label>默认巡检路线<select><option>大坝周边巡检路线-01</option></select></label>
          <label>电量预警阈值<input type="range" defaultValue="20" />20%</label>
          <label>图像/视频保留周期<input defaultValue="90" />天</label>
          <label>离线超时时间<input defaultValue="10" />分钟</label>
          <label>自动生成巡检报告<input type="checkbox" defaultChecked /></label>
          <button>保存配置</button>
        </div>
      </Panel>
      <Panel title="设备接入管理" className="span-7">
        <DataTable
          heads={['设备名称', '类型', '编码', '接入状态', '最近心跳', '固件版本', '操作']}
          rows={[
            ...Array.from({ length: 6 }, (_, index) => [`机器狗-0${index + 1}`, '机器狗', `RDOG-00${index + 1}`, '在线', '2025-05-20 10:30:12', 'v2.1.3', '查看｜编辑']),
            ['无人机-01', '无人机', 'DRONE-001', '在线', '2025-05-20 10:30:13', 'v3.2.0', '查看｜编辑'],
            ['无人机-02', '无人机', 'DRONE-002', '在线', '2025-05-20 10:30:14', 'v3.2.0', '查看｜编辑'],
          ]}
          render={(row) => <>{row.map((item, index) => <td key={index}>{index === 3 ? <Status value={item} /> : item}</td>)}</>}
        />
      </Panel>
      <Panel title="用户与角色权限矩阵" className="span-5">
        <DataTable heads={['角色', '系统管理', '设备管理', '任务管理', '巡检报告', '告警处理', '数据导出']} rows={[['管理员', '✓', '✓', '✓', '✓', '✓', '✓'], ['运维人员', '✓', '✓', '✓', '✓', '✓', '—'], ['巡检员', '—', '—', '✓', '✓', '✓', '—'], ['访客', '×', '×', '—', '×', '—', '×']]} render={(row) => <>{row.map(item => <td key={item}>{item}</td>)}</>} />
      </Panel>
      <Panel title="系统运行状态" className="span-7">
        <div className="status-grid">{[['服务器状态：正常', 23], ['存储使用情况：正常', 24], ['数据备份状态：正常', 65], ['API接口状态：正常', 99]].map(([label, value]) => <MiniStat key={label} label={label} value={<Progress value={value} />} />)}</div>
      </Panel>
    </div>
  )
}

function MiniStat({ label, value }) {
  return <div className="mini-stat"><span>{label}</span><strong>{value}</strong></div>
}

function DamMap({ compact }) {
  return (
    <div className={`dam-map ${compact ? 'compact' : ''}`}>
      <svg viewBox="0 0 100 54">
        <path d="M8 36 L18 28 L30 22 L44 15 L58 19 L73 10 L88 25" className="route-a" />
        <path d="M14 45 L29 39 L43 42 L56 35 L72 40 L88 37" className="route-b" />
        {[8, 18, 30, 44, 58, 73, 88].map((x, index) => <circle key={x} cx={x} cy={[36, 28, 22, 15, 19, 10, 25][index]} r="1.8" className="dot-a" />)}
        {[14, 29, 43, 56, 72, 88].map((x, index) => <circle key={x} cx={x} cy={[45, 39, 42, 35, 40, 37][index]} r="1.8" className="dot-b" />)}
        <circle cx="24" cy="10" r="5" className="danger-area" />
        <polygon points="70,14 86,18 78,30 65,25" className="warn-area" />
        <text x="74" y="16">D-01</text>
        <text x="77" y="35" className="green-text">D-02</text>
      </svg>
    </div>
  )
}

function FloorView() {
  return (
    <div className="floor-view">
      {['6F 配电室', '5F 电缆夹层', '4F 中控通道', '3F 机组层', '2F 油压装置', '1F 水泵房'].map((floor, index) => (
        <div className="floor" key={floor} style={{ top: index * 58 }}>
          <span>{floor}</span><div><em>R-0{index + 1}</em></div>
        </div>
      ))}
      <p>● 巡检路线　● 在线巡检　● 待命巡检　♢ 充电位置</p>
    </div>
  )
}

function Chart({ option }) {
  return <ReactECharts option={option} style={{ height: 230, width: '100%' }} notMerge lazyUpdate />
}

function chartBase() {
  return {
    backgroundColor: 'transparent',
    color: ['#1386ff', '#20c778', '#ffc928', '#9b70ff', '#10d6ff', '#ff8a28'],
    textStyle: { color: '#b8d6ef' },
    grid: { top: 38, left: 38, right: 22, bottom: 30 },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(2, 12, 27, .92)', borderColor: '#16c8ff', textStyle: { color: '#e8f5ff' } },
    legend: { top: 4, textStyle: { color: '#b8d6ef' } },
    xAxis: { type: 'category', axisLine: { lineStyle: { color: '#385c83' } }, axisLabel: { color: '#b8d6ef' }, data: ['05-14', '05-15', '05-16', '05-17', '05-18', '05-19', '05-20'] },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(108,160,210,.16)' } }, axisLabel: { color: '#b8d6ef' } },
  }
}

function barLineOption() {
  return {
    ...chartBase(),
    series: [
      { name: '巡检任务数', type: 'bar', data: [20, 26, 33, 20, 29, 32, 41], barWidth: 16 },
      { name: '完成任务数', type: 'bar', data: [16, 21, 28, 15, 23, 27, 29], barWidth: 16 },
      { name: '异常发现数', type: 'line', smooth: true, data: [3, 6, 9, 4, 7, 10, 5], lineStyle: { width: 3 } },
    ],
  }
}

function lineOption() {
  const base = chartBase()
  return {
    ...base,
    xAxis: { ...base.xAxis, data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'] },
    series: [
      { name: '1F水泵房', type: 'line', smooth: true, data: [24, 25, 26, 26, 27, 26] },
      { name: '2F油压装置', type: 'line', smooth: true, data: [25, 26, 27, 26, 28, 27] },
      { name: '3F机组层', type: 'line', smooth: true, data: [29, 31, 30, 31, 33, 31] },
      { name: '6F配电室', type: 'line', smooth: true, data: [18, 18.5, 18.8, 19, 19.2, 19.1] },
    ],
  }
}

function batteryOption() {
  const base = chartBase()
  return {
    ...base,
    xAxis: { ...base.xAxis, data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00'] },
    series: ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06'].map((name, index) => ({
      name,
      type: 'line',
      smooth: true,
      data: [95 - index * 7, 91 - index * 6, 82 - index * 5, 70 - index * 4, 55 - index * 3, 82 - index * 7],
    })),
  }
}

function alarmTrendOption() {
  const base = chartBase()
  return {
    ...base,
    series: [
      { name: '总报警数', type: 'line', smooth: true, data: [38, 41, 47, 56, 42, 28, 53] },
      { name: '高风险', type: 'line', smooth: true, data: [21, 22, 24, 27, 22, 13, 29] },
      { name: '中风险', type: 'line', smooth: true, data: [14, 13, 18, 15, 14, 11, 17] },
      { name: '低风险', type: 'line', smooth: true, data: [10, 11, 12, 10, 13, 9, 12] },
    ],
  }
}

function reportBarOption() {
  const base = chartBase()
  return { ...base, xAxis: { ...base.xAxis, data: ['12月', '1月', '2月', '3月', '4月', '5月'] }, series: [{ name: '报告数量', type: 'bar', data: [18, 24, 21, 26, 28, 27], barWidth: 22 }] }
}

function closeRateOption() {
  const base = chartBase()
  return { ...base, xAxis: { ...base.xAxis, data: ['12月', '1月', '2月', '3月', '4月', '5月'] }, yAxis: { ...base.yAxis, min: 60, max: 100 }, series: [{ name: '闭环率', type: 'line', smooth: true, data: [76, 81, 78, 83, 84, 85], lineStyle: { width: 3 } }] }
}

function donutOption(center) {
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    legend: { right: 10, top: 'middle', orient: 'vertical', textStyle: { color: '#b8d6ef' } },
    series: [{
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['35%', '50%'],
      label: { show: false },
      data: [
        { name: '已完成/渗漏疑似', value: 42 },
        { name: '处理中/温度异常', value: 28 },
        { name: '待派单/仪表异常', value: 27 },
        { name: '其他', value: 31 },
      ],
    }],
    graphic: { type: 'text', left: '29%', top: '44%', style: { text: center, fill: '#fff', fontSize: 24, fontWeight: 800, textAlign: 'center' } },
  }
}

export default App
