import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  ClipboardList,
  FileStack,
  UsersRound,
} from 'lucide-react'

const STATUS_META = [
  { key: 'uploaded', label: 'Uploaded', color: '#8c9bb2' },
  { key: 'assigned', label: 'Assigned', color: '#7888ff' },
  { key: 'pending', label: 'Pending', color: '#e6ad55' },
  { key: 'inProgress', label: 'In progress', color: '#31b9ce' },
  { key: 'completed', label: 'Completed', color: '#39bd8a' },
]

function itemStatusCounts(items = []) {
  const counts = { uploaded: 0, assigned: 0, pending: 0, inProgress: 0, completed: 0 }
  items.forEach((item) => {
    const status = String(item.status || '').toUpperCase()
    if (status === 'UPLOADED') counts.uploaded += 1
    if (status === 'ASSIGNED') counts.assigned += 1
    if (status === 'PENDING') counts.pending += 1
    if (status === 'IN_PROGRESS') counts.inProgress += 1
    if (status === 'COMPLETED') counts.completed += 1
  })
  return counts
}

function DonutChart({ data, total }) {
  const radius = 48
  const circumference = 2 * Math.PI * radius
  let traversed = 0

  return (
    <div className="analytics-donut-wrap">
      <svg className="analytics-donut" viewBox="0 0 128 128" role="img" aria-label={`Status distribution across ${total} items`}>
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--chart-track)" strokeWidth="13" />
        {total > 0 && data.map((segment) => {
          const length = (segment.value / total) * circumference
          const offset = traversed
          traversed += length
          if (!segment.value) return null
          return (
            <circle
              key={segment.key}
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="13"
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 64 64)"
              strokeLinecap="round"
            />
          )
        })}
        <text x="64" y="60" textAnchor="middle" className="analytics-donut-number">{total}</text>
        <text x="64" y="77" textAnchor="middle" className="analytics-donut-label">RECORDS</text>
      </svg>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, detail, tone, progress }) {
  return (
    <article className={`analytics-metric analytics-metric-${tone}`}>
      <div className="analytics-metric-top">
        <span className="analytics-metric-icon"><Icon size={21} strokeWidth={1.9} /></span>
        <span className="analytics-metric-tag">{tone === 'complete' ? 'RESOLVED' : tone === 'active' ? 'IN PROCESS' : tone === 'intake' ? 'NEW INTAKE' : 'REGISTER'}</span>
      </div>
      <div className="analytics-metric-value">{value}</div>
      <div className="analytics-metric-label">{label}</div>
      <div className="analytics-metric-foot"><span>{detail}</span>{progress != null && <span>{progress}%</span>}</div>
      {progress != null && <div className="analytics-progress-track"><span style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>}
    </article>
  )
}

export default function DashboardAnalytics({ summary, items = [], employees = [], employeeMode = false }) {
  const calculated = itemStatusCounts(items)
  const counts = STATUS_META.map((status) => ({
    ...status,
    value: Number(summary?.[status.key] ?? calculated[status.key] ?? 0),
  }))
  const total = Number(summary?.total ?? counts.reduce((sum, item) => sum + item.value, 0))
  const complete = Number(summary?.completed ?? calculated.completed)
  const active = Number(summary?.assigned ?? calculated.assigned)
    + Number(summary?.pending ?? calculated.pending)
    + Number(summary?.inProgress ?? calculated.inProgress)
  const progress = total > 0 ? Math.round((complete / total) * 100) : 0

  const assignedByEmployee = Object.values(items.reduce((acc, item) => {
    const name = item.employeeName?.trim()
    if (!name) return acc
    if (!acc[name]) acc[name] = { name, total: 0, active: 0, completed: 0 }
    acc[name].total += 1
    if (item.status !== 'COMPLETED') acc[name].active += 1
    else acc[name].completed += 1
    return acc
  }, {})).sort((a, b) => b.total - a.total).slice(0, 5)
  const maxEmployeeCount = Math.max(1, ...assignedByEmployee.map((employee) => employee.total))
  const employeeCount = new Set(items.map((item) => item.employeeName?.trim()).filter(Boolean)).size

  return (
    <section className="dashboard-analytics" aria-label="Operational analytics">
      <div className="analytics-intro-row">
        <div>
          <div className="analytics-eyebrow"><span /> OPERATIONAL INTELLIGENCE</div>
          <h2>{employeeMode ? 'Your work at a glance' : 'Office operations at a glance'}</h2>
          <p>{employeeMode
            ? 'A live view of your assigned records, outstanding work and completed items.'
            : 'A consolidated view of item movement, completion and staff allocation.'}</p>
        </div>
        <div className="analytics-live-pill"><Activity size={15} /><span>Current register</span><i /></div>
      </div>

      <div className="analytics-metric-grid">
        <MetricCard icon={FileStack} label="Total item records" value={total} detail="Across this register" tone="total" />
        <MetricCard icon={Clock3} label={employeeMode ? 'Items requiring action' : 'Active work queue'} value={active} detail="Assigned, pending or in progress" tone="active" />
        <MetricCard icon={CheckCircle2} label="Completed records" value={complete} detail="Marked as completed" tone="complete" progress={progress} />
        <MetricCard icon={employeeMode ? ClipboardList : UsersRound} label={employeeMode ? 'Completion rate' : 'Staff with assigned items'} value={employeeMode ? `${progress}%` : employeeCount} detail={employeeMode ? 'Completed against total records' : 'Based on the current item register'} tone="intake" />
      </div>

      <div className="analytics-chart-grid">
        <article className="analytics-panel analytics-status-panel">
          <div className="analytics-panel-heading">
            <div><span className="analytics-panel-kicker">REGISTER BREAKDOWN</span><h3>Records by status</h3></div>
            <span className="analytics-panel-icon"><BarChart3 size={18} /></span>
          </div>
          <div className="analytics-status-content">
            <DonutChart data={counts} total={total} />
            <div className="analytics-legend">
              {counts.map((status) => {
                const percent = total ? Math.round((status.value / total) * 100) : 0
                return (
                  <div className="analytics-legend-row" key={status.key}>
                    <span className="analytics-legend-dot" style={{ background: status.color }} />
                    <span className="analytics-legend-name">{status.label}</span>
                    <span className="analytics-legend-value">{status.value}</span>
                    <span className="analytics-legend-percent">{percent}%</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="analytics-chart-footnote">Status figures are based on currently accessible records.</div>
        </article>

        <article className="analytics-panel analytics-workload-panel">
          <div className="analytics-panel-heading">
            <div>
              <span className="analytics-panel-kicker">{employeeMode ? 'PERSONAL WORKLOAD' : 'TEAM ALLOCATION'}</span>
              <h3>{employeeMode ? 'My work queue' : 'Items by assigned employee'}</h3>
            </div>
            <span className="analytics-panel-icon"><UsersRound size={18} /></span>
          </div>
          {employeeMode ? (
            <div className="analytics-queue-bars">
              {counts.filter((status) => status.key !== 'uploaded').map((status) => {
                const denominator = Math.max(1, ...counts.filter((entry) => entry.key !== 'uploaded').map((entry) => entry.value))
                return (
                  <div className="analytics-queue-row" key={status.key}>
                    <div className="analytics-queue-label"><span>{status.label}</span><strong>{status.value}</strong></div>
                    <div className="analytics-horizontal-track"><span style={{ width: `${(status.value / denominator) * 100}%`, background: status.color }} /></div>
                  </div>
                )
              })}
            </div>
          ) : assignedByEmployee.length ? (
            <div className="analytics-employee-bars">
              {assignedByEmployee.map((employee, index) => (
                <div className="analytics-employee-row" key={employee.name}>
                  <div className="analytics-employee-avatar">{employee.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div>
                  <div className="analytics-employee-detail">
                    <div className="analytics-employee-label"><span>{employee.name}</span><strong>{employee.total} <small>{employee.total === 1 ? 'item' : 'items'}</small></strong></div>
                    <div className="analytics-horizontal-track"><span style={{ width: `${(employee.total / maxEmployeeCount) * 100}%`, background: index === 0 ? '#31b9b0' : index === 1 ? '#7888ff' : '#8191a7' }} /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-empty-state">
              <span><UsersRound size={23} /></span>
              <strong>No staff allocation to chart yet</strong>
              <p>Assign an item to an employee to start building the workload view.</p>
            </div>
          )}
          <div className="analytics-workload-footer">
            <span className="analytics-footer-key"><i className="analytics-footer-dot" /> {employeeMode ? 'Status volume' : 'Top employee allocation'}</span>
            <span>{employeeMode ? `${total} total records` : `${assignedByEmployee.reduce((sum, employee) => sum + employee.total, 0)} items across ${assignedByEmployee.length} employees shown`}</span>
          </div>
        </article>
      </div>
    </section>
  )
}
