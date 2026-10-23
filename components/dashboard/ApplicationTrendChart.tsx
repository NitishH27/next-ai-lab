"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyApplicationCount } from "@/lib/applications";

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text)",
  fontSize: 12,
};

const legend = [
  { key: "applied", label: "Applied" },
  { key: "rejected", label: "Rejected" },
  { key: "interview", label: "Interview" },
] as const;

export default function ApplicationTrendChart({ data }: { data: WeeklyApplicationCount[] }) {
  const total = data.reduce(
    (sum, week) => sum + week.applied + week.rejected + week.interview,
    0,
  );

  return (
    <section aria-labelledby="trend-heading">
      <figure className="dashboard-chart">
        <figcaption className="dashboard-chart-header">
          <h2 id="trend-heading">Applications sent</h2>
          <span>Last 12 weeks · {total} tracked</span>
        </figcaption>
        <ul className="dashboard-chart-legend" aria-label="Chart series">
          {legend.map((item) => (
            <li key={item.key}>
              <span
                className={`dashboard-chart-swatch dashboard-chart-swatch--${item.key}`}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
        {total === 0 ? (
          <p className="dashboard-chart-empty">
            No applied, rejected, or interview applications in the last 12 weeks.
          </p>
        ) : (
          <div className="dashboard-chart-plot" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  width={36}
                  tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "var(--border)" }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: "var(--text)" }}
                  formatter={(value) => `${value}`}
                  labelFormatter={(label) => `Week of ${label}`}
                />
                <Line
                  type="linear"
                  dataKey="applied"
                  name="Applied"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
                <Line
                  type="linear"
                  dataKey="rejected"
                  name="Rejected"
                  stroke="var(--danger)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
                <Line
                  type="linear"
                  dataKey="interview"
                  name="Interview"
                  stroke="var(--success)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--surface)", strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="visually-hidden">
          <table>
            <caption>Applications per week by status over the last 12 weeks</caption>
            <thead>
              <tr>
                <th scope="col">Week of</th>
                <th scope="col">Applied</th>
                <th scope="col">Rejected</th>
                <th scope="col">Interview</th>
              </tr>
            </thead>
            <tbody>
              {data.map((week) => (
                <tr key={week.weekStart}>
                  <th scope="row">{week.label}</th>
                  <td>{week.applied}</td>
                  <td>{week.rejected}</td>
                  <td>{week.interview}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    </section>
  );
}
