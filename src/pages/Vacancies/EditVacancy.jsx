import { useParams } from "react-router-dom";
import CreateVacancy from "./CreateVacancy";

export default function EditVacancy() {
  const { id } = useParams();
  return <CreateVacancy key={id} vacancyId={id} />;
}
