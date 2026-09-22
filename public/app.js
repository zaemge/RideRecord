const fuelModal =
  document.getElementById("fuelModal");

const openFuelModal =
  document.getElementById("openFuelModal");

const closeFuelModal =
  document.getElementById("closeFuelModal");

const fuelForm =
  document.getElementById("fuelForm");

const fuelSubmitButton =
  fuelForm.querySelector(
    'button[type="submit"]'
  );

const fuelPrice =
  document.getElementById("fuelPrice");

const fuelLiters =
  document.getElementById("fuelLiters");

const costPreview =
  document.getElementById("costPreview");

const fuelHistory =
  document.getElementById("fuelHistory");

const vehicleSelect =
  document.getElementById("vehicleSelect");

const fuelVehicle =
  document.getElementById("fuelVehicle");

const currentVehicle =
  document.getElementById("currentVehicle");

const addVehicleButton =
  document.getElementById("addVehicleButton");

const vehicleModal =
  document.getElementById("vehicleModal");

const closeVehicleModal =
  document.getElementById("closeVehicleModal");

const vehicleNameInput =
  document.getElementById("vehicleNameInput");

const saveVehicleButton =
  document.getElementById("saveVehicleButton");

const vehicleList =
  document.getElementById("vehicleList");

const fuelDate =
  document.getElementById("fuelDate");

const odometerInput =
  document.getElementById("odometer");


/* =========================
   ข้อมูล
========================= */

let records =
  JSON.parse(
    localStorage.getItem("fuelRecords")
  ) || [];

let vehicles =
  JSON.parse(
    localStorage.getItem("vehicles")
  ) || [];

let editingVehicle = null;

let editingFuelId = null;


/* =========================
   ดึงชื่อรถจากข้อมูลเก่า
========================= */

records.forEach(record => {

  if (
    record.vehicle &&
    !vehicles.includes(record.vehicle)
  ) {

    vehicles.push(record.vehicle);

  }

});


if (vehicles.length === 0) {

  vehicles = [
    "Honda Civic"
  ];

}


/* =========================
   บันทึกข้อมูล
========================= */

function saveVehicles() {

  localStorage.setItem(
    "vehicles",
    JSON.stringify(vehicles)
  );

}


function saveRecords() {

  localStorage.setItem(
    "fuelRecords",
    JSON.stringify(records)
  );

}


/* =========================
   รถ
========================= */

function renderVehicles(
  selectedVehicle = null
) {

  const oldSelected =
    selectedVehicle ||
    vehicleSelect.value ||
    vehicles[0];


  vehicleSelect.innerHTML = "";

  fuelVehicle.innerHTML = "";


  vehicles.forEach(vehicle => {

    const option1 =
      document.createElement("option");

    option1.value = vehicle;
    option1.textContent = vehicle;

    vehicleSelect.appendChild(
      option1
    );


    const option2 =
      document.createElement("option");

    option2.value = vehicle;
    option2.textContent = vehicle;

    fuelVehicle.appendChild(
      option2
    );

  });


  if (
    vehicles.includes(oldSelected)
  ) {

    vehicleSelect.value =
      oldSelected;

  } else {

    vehicleSelect.value =
      vehicles[0];

  }


  fuelVehicle.value =
    vehicleSelect.value;


  currentVehicle.textContent =
    vehicleSelect.value;


  renderVehicleList();

}


/* =========================
   เปิดหน้าจัดการรถ
========================= */

addVehicleButton.addEventListener(
  "click",
  () => {

    editingVehicle = null;

    vehicleNameInput.value = "";

    saveVehicleButton.textContent =
      "เพิ่มรถ";


    renderVehicleList();


    vehicleModal.classList.add(
      "show"
    );


    setTimeout(
      () => {

        vehicleNameInput.focus();

      },
      100
    );

  }
);


/* =========================
   ปิดหน้าจัดการรถ
========================= */

closeVehicleModal.addEventListener(
  "click",
  () => {

    vehicleModal.classList.remove(
      "show"
    );

  }
);


document
  .querySelector(
    ".vehicle-backdrop"
  )
  .addEventListener(
    "click",
    () => {

      vehicleModal.classList.remove(
        "show"
      );

    }
  );


/* =========================
   เพิ่ม / แก้ไขรถ
========================= */

saveVehicleButton.addEventListener(
  "click",
  saveVehicle
);


vehicleNameInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      saveVehicle();

    }

  }
);


function saveVehicle() {

  const newName =
    vehicleNameInput.value.trim();


  if (!newName) {

    alert(
      "กรุณากรอกชื่อรถ"
    );

    return;

  }


  /* เพิ่มรถ */

  if (
    editingVehicle === null
  ) {

    if (
      vehicles.includes(newName)
    ) {

      alert(
        "มีรถชื่อนี้อยู่แล้ว"
      );

      return;

    }


    vehicles.push(
      newName
    );


    saveVehicles();


    renderVehicles(
      newName
    );


    vehicleNameInput.value =
      "";


    vehicleModal.classList.remove(
      "show"
    );


    updateSummary();


    return;

  }


  /* แก้ไขชื่อรถ */

  if (
    newName !== editingVehicle &&
    vehicles.includes(newName)
  ) {

    alert(
      "มีรถชื่อนี้อยู่แล้ว"
    );

    return;

  }


  const index =
    vehicles.indexOf(
      editingVehicle
    );


  if (
    index !== -1
  ) {

    vehicles[index] =
      newName;

  }


  /* เปลี่ยนชื่อรถในประวัติด้วย */

  records =
    records.map(
      record => {

        if (
          record.vehicle ===
          editingVehicle
        ) {

          return {
            ...record,
            vehicle: newName
          };

        }


        return record;

      }
    );


  saveVehicles();

  saveRecords();


  editingVehicle = null;


  vehicleNameInput.value =
    "";


  saveVehicleButton.textContent =
    "เพิ่มรถ";


  renderVehicles(
    newName
  );


  updateSummary();

}


/* =========================
   รายการรถ
========================= */

function renderVehicleList() {

  vehicleList.innerHTML =
    "";


  vehicles.forEach(
    vehicle => {

      const item =
       