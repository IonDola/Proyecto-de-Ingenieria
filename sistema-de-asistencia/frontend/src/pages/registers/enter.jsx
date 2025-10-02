import { useEffect, useState } from "react"
import PageHead from "../../components/PageHead"
import StForm from "../../components/RegisterForm"

import StudentIcon from "../../assets/icons/student.svg"
import StudentActions from "../../assets/icons/student_registers.svg"
import StudentEnter from "../../assets/icons/enter.svg"


const Enter = ({ }) => {
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
    const [register, setRegister] = useState({});
    useEffect(() => {
        fetch("/api/student/model") // <- devuelve estructura del modelo
            .then((r) => r.json())
            .then((data) => setRegister(data));
    }, []);
    return (
        <>
            <PageHead icons={iconList} />
            <main>
                <StForm register={register}>

                </StForm>
            </main>
        </>
    );
};

export default Enter;