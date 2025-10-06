import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import PageHead from "../../components/PageHead"
import StForm from "../../components/RegisterForm"
import { formatRegister } from "../../components/RegisterFormat"

import StudentIcon from "../../assets/icons/student.svg"
import StudentActions from "../../assets/icons/student_registers.svg"
import StudentEnter from "../../assets/icons/enter.svg"


const EnterForm = () => {
  const iconList = [
    {
      id: 1,
      image: StudentIcon,
      description: "Estudiantes"
    },
    {
      id: 2,
      image: StudentActions,
      description: "Perfiles"
    },
    {
      id: 3,
      image: StudentEnter,
      description: "Ingreso"
    },
  ];
  const { actionId } = useParams();
  const [action, setAction] = useState({});
  const [studentId, setStId] = useState("");
  const [student, setStudent] = useState({});

  function fetchError(err) {
    console.error(err);
    return;
  };

  useEffect(() => {
    if (!actionId) return;
    const controller = new AbortController();

    const fetchAction = async () => {
      try {
        const res = await fetch(`/api/actions/${actionId}/`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }

        const data = await res.json();
        setAction(data);
        setStId(data.student_id)
      } catch (err) {
        fetchError(err);
      }
    };

    fetchAction();
  }, [actionId]);

  useEffect(() => {
    if (!studentId) return;
    const controller = new AbortController();

    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students/${studentId}/`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Error ${res.status}`);
        }

        const data = await res.json();
        setStudent(data);
      } catch (err) {
        if (err.name !== "AbortError") fetchError(err);
      }
    };

    fetchStudent();
  }, [action?.student_id]);

  const [register, legalGuardians, carnet, revitionState] = formatRegister({ action, student });
  return (
    <>
      <PageHead icons={iconList} />
      <main>
        {actionId &&
          <StForm
            register={register}
            carnet={carnet} legalGuardians={legalGuardians}
          />
        }
        {!actionId &&
          <StForm
            register={register}
            carnet={carnet} legalGuardians={legalGuardians}
            isNew
            isOnRevision={revitionState}
          />
        }
      </main>
    </>
  );
};

export default EnterForm;