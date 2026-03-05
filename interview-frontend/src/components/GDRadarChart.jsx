import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from "recharts";

export default function GDRadarChart({ scores }) {

const data = [

{ subject: "Communication", score: scores.communication },
{ subject: "Confidence", score: scores.confidence },
{ subject: "Relevance", score: scores.relevance },
{ subject: "Participation", score: scores.participation },
{ subject: "Critical Thinking", score: scores.criticalThinking }

];

return (

<div style={{ width: "100%", height: 400 }}>

<ResponsiveContainer>

<RadarChart data={data}>

<PolarGrid />

<PolarAngleAxis dataKey="subject" />

<PolarRadiusAxis angle={30} domain={[0,10]} />

<Radar
name="Score"
dataKey="score"
stroke="#4f46e5"
fill="#4f46e5"
fillOpacity={0.6}
/>

</RadarChart>

</ResponsiveContainer>

</div>

);

}