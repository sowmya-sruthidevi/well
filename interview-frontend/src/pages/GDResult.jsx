import { useLocation } from "react-router-dom";
import GDRadarChart from "../components/GDRadarChart";

export default function GDResult(){

const location = useLocation();

const { scores, improvements, totalScore } = location.state;

return(

<div className="p-8">

<h1 className="text-2xl font-bold mb-4">
GD Performance Result
</h1>

<h2 className="mb-4">
Total Score: {totalScore}
</h2>

<GDRadarChart scores={scores} />

<h3 className="mt-6 font-semibold">
Improvements
</h3>

<ul>

{improvements.map((item,index)=>(
<li key={index}>{item}</li>
))}

</ul>

</div>

);

}