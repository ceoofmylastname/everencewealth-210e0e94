import SVGLineChart from "./charts/SVGLineChart";

const SP500_DATA = [
  { x: 1999, y: 50000 }, { x: 2000, y: 59880 }, { x: 2002, y: 38000 },
  { x: 2004, y: 55000 }, { x: 2007, y: 80000 }, { x: 2008, y: 61468 },
  { x: 2010, y: 72000 }, { x: 2013, y: 130000 }, { x: 2016, y: 160000 },
  { x: 2018, y: 200000 }, { x: 2020, y: 170000 }, { x: 2022, y: 280000 },
  { x: 2025, y: 408888 },
];

const INDEXED_DATA = [
  { x: 1999, y: 50000 }, { x: 2000, y: 56000 }, { x: 2002, y: 56000 },
  { x: 2004, y: 70000 }, { x: 2007, y: 100000 }, { x: 2008, y: 100000 },
  { x: 2010, y: 112000 }, { x: 2013, y: 180000 }, { x: 2016, y: 240000 },
  { x: 2018, y: 300000 }, { x: 2020, y: 300000 }, { x: 2022, y: 420000 },
  { x: 2025, y: 541391 },
];

interface PerformanceChartProps {
  animate?: boolean;
  className?: string;
}

export default function PerformanceChart({ animate = false, className }: PerformanceChartProps) {
  return (
    <SVGLineChart
      className={className}
      animate={animate}
      datasets={[
        { data: SP500_DATA, color: "#E87070", label: "S&P 500 Direct" },
        { data: INDEXED_DATA, color: "#1A4D3E", label: "Indexed Strategy" },
      ]}
      xLabels={["1999", "2005", "2010", "2015", "2020", "2025"]}
      yFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
      height={350}
    />
  );
}
