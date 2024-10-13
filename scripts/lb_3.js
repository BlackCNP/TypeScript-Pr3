"use strict";
//  Робота з масивами даних
// a) Масиви
let professors = [];
let classrooms = [];
let courses = [];
let schedule = [];
//  Функції для додавання даних
//b) addProfessor
function addProfessor(professor) {
    const exists = professors.some(p => p.id === professor.id);
    if (exists) {
        logError(`[ERR]: Професор з ID ${professor.id} вже існує.`);
        return;
    }
    professors.push(professor);
    logMessage(`[LOG]: Додано професора: ${professor.name}`);
}
// addClassroom
function addClassroom(classroom) {
    const exists = classrooms.some(c => c.number === classroom.number);
    if (exists) {
        logError(`[ERR]: Аудиторія з номером ${classroom.number} вже існує.`);
        return;
    }
    classrooms.push(classroom);
    logMessage(`[LOG]: Додано аудиторію: ${classroom.number}`);
}
/*
 addCourse
 */
function addCourse(course) {
    const exists = courses.some(c => c.id === course.id);
    if (exists) {
        logError(`[ERR]: Курс з ID ${course.id} вже існує.`);
        return;
    }
    courses.push(course);
    logMessage(`[LOG]: Додано курс: ${course.name}`);
}
//c) addLesson
function addLesson(lesson) {
    const conflict = validateLesson(lesson);
    if (conflict) {
        logError(`[ERR]: Конфлікт (${conflict.type}) для заняття з ID ${lesson.id}.`);
        return false;
    }
    schedule.push(lesson);
    logMessage(`[LOG]: Додано заняття з ID ${lesson.id}`);
    return true;
}
//  Функції пошуку та фільтрації
// a) findAvailableClassrooms
function findAvailableClassrooms(timeSlot, dayOfWeek) {
    const allClassrooms = classrooms.map(c => c.number);
    const occupied = schedule
        .filter(lesson => lesson.dayOfWeek === dayOfWeek && lesson.timeSlot === timeSlot)
        .map(lesson => lesson.classroomNumber);
    const available = allClassrooms.filter(number => !occupied.includes(number));
    logMessage(`[LOG]: Доступні аудиторії на ${dayOfWeek} ${timeSlot}: ${available.join(", ")}`);
    return available;
}
//b) getProfessorSchedule
function getProfessorSchedule(professorId) {
    const profSchedule = schedule.filter(lesson => lesson.professorId === professorId);
    logMessage(`[LOG]: Розклад професора ID ${professorId}: ${JSON.stringify(profSchedule)}`);
    return profSchedule;
}
// b) validateLesson
function validateLesson(lesson) {
    // Перевірка конфлікту для професора
    const professorConflict = schedule.find(existingLesson => existingLesson.professorId === lesson.professorId &&
        existingLesson.dayOfWeek === lesson.dayOfWeek &&
        existingLesson.timeSlot === lesson.timeSlot);
    if (professorConflict) {
        return {
            type: "ProfessorConflict",
            lessonDetails: professorConflict
        };
    }
    // Перевірка конфлікту для аудиторії
    const classroomConflict = schedule.find(existingLesson => existingLesson.classroomNumber === lesson.classroomNumber &&
        existingLesson.dayOfWeek === lesson.dayOfWeek &&
        existingLesson.timeSlot === lesson.timeSlot);
    if (classroomConflict) {
        return {
            type: "ClassroomConflict",
            lessonDetails: classroomConflict
        };
    }
    return null;
}
// 7. Аналіз та звіти
/*
 
Повертає відсоток використання аудиторії.
 
 */
function getClassroomUtilization(classroomNumber) {
    const totalDays = 5; // Понеділок - П'ятниця
    const totalTimeSlotsPerDay = 5;
    const totalTimeSlots = totalDays * totalTimeSlotsPerDay;
    const usedTimeSlots = schedule.filter(lesson => lesson.classroomNumber === classroomNumber).length;
    const utilization = (usedTimeSlots / totalTimeSlots) * 100;
    logMessage(`[LOG]: Використання аудиторії ${classroomNumber}: ${utilization.toFixed(2)}%`);
    return utilization;
}
/*
b) getMostPopularCourseType

 */
function getMostPopularCourseType() {
    const typeCount = {};
    schedule.forEach(lesson => {
        const course = courses.find(c => c.id === lesson.courseId);
        if (course) {
            typeCount[course.type] = (typeCount[course.type] || 0) + 1;
        }
    });
    let maxCount = 0;
    let popularType = null;
    for (const type in typeCount) {
        const count = typeCount[type];
        if (count > maxCount) {
            maxCount = count;
            popularType = type;
        }
    }
    logMessage(`[LOG]: Найпопулярніший тип занять: ${popularType}`);
    return popularType;
}
//  Модифікація даних
/*
 a) reassignClassroom
 */
function reassignClassroom(lessonId, newClassroomNumber) {
    const lessonIndex = schedule.findIndex(lesson => lesson.id === lessonId);
    if (lessonIndex === -1) {
        logError(`[ERR]: Заняття з ID ${lessonId} не знайдено.`);
        return false;
    }
    const lesson = schedule[lessonIndex];
    // Перевірка доступності нової аудиторії
    const conflict = schedule.find(existingLesson => existingLesson.classroomNumber === newClassroomNumber &&
        existingLesson.dayOfWeek === lesson.dayOfWeek &&
        existingLesson.timeSlot === lesson.timeSlot);
    if (conflict) {
        logError(`[ERR]: Аудиторія ${newClassroomNumber} вже зайнята в цей час.`);
        return false;
    }
    // Перевизначення аудиторії
    schedule[lessonIndex].classroomNumber = newClassroomNumber;
    logMessage(`[LOG]: Аудиторію змінено на ${newClassroomNumber} для заняття з ID ${lessonId}.`);
    return true;
}
/*
b) cancelLesson
 */
function cancelLesson(lessonId) {
    const lessonIndex = schedule.findIndex(lesson => lesson.id === lessonId);
    if (lessonIndex === -1) {
        logError(`[ERR]: Заняття з ID ${lessonId} не знайдено.`);
        return;
    }
    const removedLesson = schedule.splice(lessonIndex, 1)[0];
    logMessage(`[LOG]: Заняття з ID ${lessonId} скасовано.`);
}
// Додаткові Функції та Покращення
// a) Логування
const logDiv = document.getElementById("log");
function logMessage(message) {
    console.log(message);
    if (logDiv) {
        const p = document.createElement("p");
        p.textContent = message;
        logDiv.appendChild(p);
    }
}
function logError(message) {
    console.error(message);
    if (logDiv) {
        const p = document.createElement("p");
        p.textContent = message;
        p.style.color = "red";
        logDiv.appendChild(p);
    }
}
function clearForm(ids) {
    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element instanceof HTMLInputElement) {
                if (element.type === "checkbox") {
                    element.checked = false;
                }
                else {
                    element.value = "";
                }
            }
            else if (element instanceof HTMLSelectElement) {
                element.selectedIndex = 0;
            }
        }
    });
}
// Обробники подій
document.addEventListener("DOMContentLoaded", () => {
    // Додавання професора
    const addProfessorBtn = document.getElementById("add-professor-btn");
    addProfessorBtn.addEventListener("click", () => {
        const idInput = document.getElementById("prof-id");
        const nameInput = document.getElementById("prof-name");
        const departmentInput = document.getElementById("prof-department");
        const id = parseInt(idInput.value);
        const name = nameInput.value.trim();
        const department = departmentInput.value.trim();
        if (isNaN(id) || !name || !department) {
            logError("[ERR]: Будь ласка, заповніть всі поля для додавання професора.");
            return;
        }
        addProfessor({ id, name, department });
        // Очистка форми після успішного додавання
        clearForm(["prof-id", "prof-name", "prof-department"]);
    });
    // Додавання аудиторії
    const addClassroomBtn = document.getElementById("add-classroom-btn");
    addClassroomBtn.addEventListener("click", () => {
        const numberInput = document.getElementById("class-number");
        const capacityInput = document.getElementById("class-capacity");
        const projectorInput = document.getElementById("class-projector");
        const number = numberInput.value.trim();
        const capacity = parseInt(capacityInput.value);
        const hasProjector = projectorInput.checked;
        if (!number || isNaN(capacity)) {
            logError("[ERR]: Будь ласка, заповніть всі поля для додавання аудиторії.");
            return;
        }
        addClassroom({ number, capacity, hasProjector });
        // Очистка форми після успішного додавання
        clearForm(["class-number", "class-capacity", "class-projector"]);
    });
    // Додавання курсу
    const addCourseBtn = document.getElementById("add-course-btn");
    addCourseBtn.addEventListener("click", () => {
        const idInput = document.getElementById("course-id");
        const nameInput = document.getElementById("course-name");
        const typeSelect = document.getElementById("course-type");
        const id = parseInt(idInput.value);
        const name = nameInput.value.trim();
        const type = typeSelect.value;
        if (isNaN(id) || !name || !type) {
            logError("[ERR]: Будь ласка, заповніть всі поля для додавання курсу.");
            return;
        }
        addCourse({ id, name, type });
        // Очистка форми після успішного додавання
        clearForm(["course-id", "course-name", "course-type"]);
    });
    // Додавання заняття
    const addLessonBtn = document.getElementById("add-lesson-btn");
    addLessonBtn.addEventListener("click", () => {
        const idInput = document.getElementById("lesson-id");
        const courseIdInput = document.getElementById("lesson-courseId");
        const professorIdInput = document.getElementById("lesson-professorId");
        const classroomInput = document.getElementById("lesson-classroom");
        const daySelect = document.getElementById("lesson-day");
        const timeSlotSelect = document.getElementById("lesson-timeslot");
        const id = parseInt(idInput.value);
        const courseId = parseInt(courseIdInput.value);
        const professorId = parseInt(professorIdInput.value);
        const classroomNumber = classroomInput.value.trim();
        const dayOfWeek = daySelect.value;
        const timeSlot = timeSlotSelect.value;
        if (isNaN(id) || isNaN(courseId) || isNaN(professorId) || !classroomNumber || !dayOfWeek || !timeSlot) {
            logError("[ERR]: Будь ласка, заповніть всі поля для додавання заняття.");
            return;
        }
        const success = addLesson({
            id,
            courseId,
            professorId,
            classroomNumber,
            dayOfWeek,
            timeSlot
        });
        if (success) {
            // Очистка форми після успішного додавання
            clearForm([
                "lesson-id",
                "lesson-courseId",
                "lesson-professorId",
                "lesson-classroom",
                "lesson-day",
                "lesson-timeslot"
            ]);
        }
    });
    // Пошук доступних аудиторій
    const findClassroomsBtn = document.getElementById("find-classrooms-btn");
    findClassroomsBtn.addEventListener("click", () => {
        const day = document.getElementById("find-day").value;
        const timeSlot = document.getElementById("find-timeslot").value;
        const available = findAvailableClassrooms(timeSlot, day);
        if (available.length > 0) {
            logMessage(`[LOG]: Вільні аудиторії: ${available.join(", ")}`);
        }
        else {
            logMessage(`[LOG]: Вільних аудиторій немає.`);
        }
    });
    // Отримання розкладу професора
    const getProfessorScheduleBtn = document.getElementById("get-professor-schedule-btn");
    getProfessorScheduleBtn.addEventListener("click", () => {
        const profIdInput = document.getElementById("prof-schedule-id");
        const profId = parseInt(profIdInput.value);
        if (isNaN(profId)) {
            logError("[ERR]: Будь ласка, введіть коректний ID професора.");
            return;
        }
        const profSchedule = getProfessorSchedule(profId);
        if (profSchedule.length === 0) {
            logMessage(`[LOG]: Професор з ID ${profId} не має занять.`);
        }
    });
    // Аналіз використання аудиторії
    const getClassroomUtilizationBtn = document.getElementById("get-classroom-utilization-btn");
    getClassroomUtilizationBtn.addEventListener("click", () => {
        const classroomNumberInput = document.getElementById("util-classroom-number");
        const classroomNumber = classroomNumberInput.value.trim();
        if (!classroomNumber) {
            logError("[ERR]: Будь ласка, введіть номер аудиторії.");
            return;
        }
        const utilization = getClassroomUtilization(classroomNumber);
        if (isNaN(utilization)) {
            logError(`[ERR]: Аудиторія ${classroomNumber} не існує.`);
        }
    });
    // Найпопулярніший тип занять
    const getMostPopularCourseTypeBtn = document.getElementById("get-popular-course-type-btn");
    getMostPopularCourseTypeBtn.addEventListener("click", () => {
        const popularType = getMostPopularCourseType();
        if (popularType) {
            logMessage(`[LOG]: Найпопулярніший тип занять: ${popularType}`);
        }
        else {
            logMessage(`[LOG]: Розклад порожній.`);
        }
    });
    // Перевизначення аудиторії
    const reassignClassroomBtn = document.getElementById("reassign-classroom-btn");
    reassignClassroomBtn.addEventListener("click", () => {
        const lessonIdInput = document.getElementById("reassign-lesson-id");
        const newClassroomInput = document.getElementById("reassign-new-classroom");
        const lessonId = parseInt(lessonIdInput.value);
        const newClassroom = newClassroomInput.value.trim();
        if (isNaN(lessonId) || !newClassroom) {
            logError("[ERR]: Будь ласка, заповніть всі поля для перевизначення аудиторії.");
            return;
        }
        reassignClassroom(lessonId, newClassroom);
    });
    // Скасування заняття
    const cancelLessonBtn = document.getElementById("cancel-lesson-btn");
    cancelLessonBtn.addEventListener("click", () => {
        const lessonIdInput = document.getElementById("cancel-lesson-id");
        const lessonId = parseInt(lessonIdInput.value);
        if (isNaN(lessonId)) {
            logError("[ERR]: Будь ласка, введіть коректний ID заняття.");
            return;
        }
        cancelLesson(lessonId);
    });
    //ДЛЯ ТЕСТУВАННЯ
    /*
  
    addProfessor({ id: 1, name: "Іваненко Іван", department: "Математика" });
    addProfessor({ id: 2, name: "Петров Петро", department: "Фізика" });
    
    // Додавання аудиторій
    addClassroom({ number: "A101", capacity: 30, hasProjector: true });
    addClassroom({ number: "B202", capacity: 50, hasProjector: false });
    addClassroom({ number: "C303", capacity: 40, hasProjector: true });
    
    
    addCourse({ id: 1, name: "Алгебра", type: "Lecture" });
    addCourse({ id: 2, name: "Механіка", type: "Lab" });
    addCourse({ id: 3, name: "Фізика", type: "Seminar" });
    
   
    addLesson({
      id: 1,
      courseId: 1,
      professorId: 1,
      classroomNumber: "A101",
      dayOfWeek: "Monday",
      timeSlot: "8:30-10:00"
    });
    
    addLesson({
      id: 2,
      courseId: 2,
      professorId: 2,
      classroomNumber: "B202",
      dayOfWeek: "Monday",
      timeSlot: "10:15-11:45"
    });
    
    addLesson({
      id: 3,
      courseId: 3,
      professorId: 1,
      classroomNumber: "C303",
      dayOfWeek: "Tuesday",
      timeSlot: "14:00-15:30"
    });
    
   
    addLesson({
      id: 4,
      courseId: 1,
      professorId: 1,
      classroomNumber: "A101",
      dayOfWeek: "Monday",
      timeSlot: "8:30-10:00" // Конфлікт з заняттям ID 1
    });
    
  
    findAvailableClassrooms("8:30-10:00", "Monday");
    
    
    getProfessorSchedule(1);
    
    
    getClassroomUtilization("A101");
    getClassroomUtilization("B202");
    getClassroomUtilization("C303");
    
   
    getMostPopularCourseType();
    
   
    reassignClassroom(1, "B202"); // Спроба перевизначити на зайняту аудиторію
    reassignClassroom(1, "C303"); // Успішна зміна аудиторії
  
    cancelLesson(2);
    
    
    logMessage(`[LOG]: Оновлений розклад: ${JSON.stringify(schedule)}`);
    */
});
