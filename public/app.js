const fuelModal = document.getElementById("fuelModal");
const openFuelModal = document.getElementById("openFuelModal");
const closeFuelModal = document.getElementById("closeFuelModal");
const fuelForm = document.getElementById("fuelForm");

const fuelPrice = document.getElementById("fuelPrice");
const fuelLiters = document.getElementById("fuelLiters");
const costPreview = document.getElementById("costPreview");
const fuelHistory = document.getElementById("fuelHistory");

const vehicleSelect = document.getElementById("vehicleSelect");
const fuelVehicle = document.getElementById("fuelVehicle");
const currentVehicle = document.getElementById("currentVehicle");
const addVehicleButton = document.getElementById("addVehicleButton");

const vehicleModal = document.getElementById("vehicleModal");
const closeVehicleModal = document.getElementById("closeVehicleModal");
const vehicleNameInput = document.getElementById("vehicleNameInput");
const saveVehicleButton = document.getElementById("saveVehicleButton");
const vehicleList = document.getElementById("vehicleList");

const fuelDate = document.getElementById("fuelDate");
const odometerInput = document.getElementById("odometer");

let records =
  JSON.parse(localStorage.getItem("fuelRecords")) || [];

let vehicles =
  JSON.parse(localStorage.getItem("vehicles")) || [];


/* =========================
   ดึงรถจากข้อมูลเก่า
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
  vehicles = ["Honda Civic"];
}


let editingVehicle = null;


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
   แสดงรายการรถ
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

    vehicleSelect.appendChild(option1);


    const option2 =
      document.createElement("option");

    option2.value = vehicle;
    option2.textContent = vehicle;

    fuelVehicle.appendChild(option2);

  });


  if (vehicles.includes(oldSelected)) {

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


    setTimeout(() => {

      vehicleNameInput.focus();

    }, 100);

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
  .querySelector(".vehicle-backdrop")
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

    if (event.key === "Enter") {

      saveVehicle();

    }

  }
);


function saveVehicle() {

  const newName =
    vehicleNameInput.value.trim();


  if (!newName) {

    alert("กรุณากรอกชื่อรถ");

    return;

  }


  /* เพิ่มรถใหม่ */

  if (editingVehicle === null) {

    if (
      vehicles.includes(newName)
    ) {

      alert("มีรถชื่อนี้อยู่แล้ว");

      return;

    }


    vehicles.push(newName);


    saveVehicles();


    renderVehicles(newName);


    vehicleNameInput.value = "";


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

    alert("มีรถชื่อนี้อยู่แล้ว");

    return;

  }


  const index =
    vehicles.indexOf(
      editingVehicle
    );


  if (index !== -1) {

    vehicles[index] =
      newName;

  }


  /* เปลี่ยนชื่อในประวัติน้ำมัน */

  records =
    records.map(record => {

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

    });


  saveVehicles();

  saveRecords();


  editingVehicle = null;


  saveVehicleButton.textContent =
    "เพิ่มรถ";


  vehicleNameInput.value = "";


  renderVehicles(newName);


  updateSummary();

}


/* =========================
   รายการรถในหน้าจัดการ
========================= */

function renderVehicleList() {

  vehicleList.innerHTML = "";


  vehicles.forEach(vehicle => {

    const item =
      document.createElement(
        "div"
      );


    item.className =
      "vehicle-list-item";


    const name =
      document.createElement(
        "div"
      );


    name.className =
      "vehicle-list-name";


    name.textContent =
      vehicle;


    const actions =
      document.createElement(
        "div"
      );


    actions.className =
      "vehicle-list-actions";


    /* ปุ่มแก้ไข */

    const editButton =
      document.createElement(
        "button"
      );


    editButton.type =
      "button";


    editButton.className =
      "vehicle-edit-button";


    editButton.textContent =
      "แก้ไข";


    editButton.addEventListener(
      "click",
      () => {

        editingVehicle =
          vehicle;


        vehicleNameInput.value =
          vehicle;


        saveVehicleButton.textContent =
          "บันทึกการแก้ไข";


        vehicleNameInput.focus();

      }
    );


    /* ปุ่มลบ */

    const deleteButton =
      document.createElement(
        "button"
      );


    deleteButton.type =
      "button";


    deleteButton.className =
      "vehicle-delete-button";


    deleteButton.textContent =
      "ลบ";


    deleteButton.addEventListener(
      "click",
      () => {

        deleteVehicle(vehicle);

      }
    );


    actions.appendChild(
      editButton
    );


    actions.appendChild(
      deleteButton
    );


    item.appendChild(name);

    item.appendChild(actions);


    vehicleList.appendChild(
      item
    );

  });

}


/* =========================
   ลบรถ
========================= */

function deleteVehicle(vehicle) {

  if (vehicles.length === 1) {

    alert(
      "ต้องมีรถอย่างน้อย 1 คัน"
    );

    return;

  }


  const confirmed =
    confirm(
      `ต้องการลบ "${vehicle}" และประวัติการเติมน้ำมันของรถคันนี้หรือไม่?`
    );


  if (!confirmed) {

    return;

  }


  vehicles =
    vehicles.filter(
      item =>
        item !== vehicle
    );


  records =
    records.filter(
      record =>
        record.vehicle !== vehicle
    );


  saveVehicles();

  saveRecords();


  editingVehicle = null;


  vehicleNameInput.value = "";


  saveVehicleButton.textContent =
    "เพิ่มรถ";


  renderVehicles(
    vehicles[0]
  );


  updateSummary();

}


/* =========================
   เปลี่ยนรถที่เลือก
========================= */

vehicleSelect.addEventListener(
  "change",
  () => {

    currentVehicle.textContent =
      vehicleSelect.value;


    fuelVehicle.value =
      vehicleSelect.value;


    updateSummary();

  }
);


/* =========================
   วันที่วันนี้
========================= */

function setTodayDate() {

  fuelDate.value =
    new Date()
      .toISOString()
      .split("T")[0];

}


setTodayDate();


/* =========================
   เปิดหน้าต่างเติมน้ำมัน
========================= */

openFuelModal.addEventListener(
  "click",
  () => {

    fuelVehicle.value =
      vehicleSelect.value;


    fuelModal.classList.add(
      "show"
    );

  }
);


/* =========================
   ปิดหน้าต่างเติมน้ำมัน
========================= */

closeFuelModal.addEventListener(
  "click",
  () => {

    fuelModal.classList.remove(
      "show"
    );

  }
);


document
  .querySelector(
    "#fuelModal .modal-backdrop"
  )
  .addEventListener(
    "click",
    () => {

      fuelModal.classList.remove(
        "show"
      );

    }
  );


/* =========================
   คำนวณยอดเติม
========================= */

function updateCostPreview() {

  const price =
    Number(
      fuelPrice.value
    ) || 0;


  const liters =
    Number(
      fuelLiters.value
    ) || 0;


  const total =
    price * liters;


  costPreview.textContent =
    `฿${total.toLocaleString(
      "th-TH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;

}


fuelPrice.addEventListener(
  "input",
  updateCostPreview
);


fuelLiters.addEventListener(
  "input",
  updateCostPreview
);


/* =========================
   บันทึกการเติมน้ำมัน
========================= */

fuelForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const price =
      Number(
        fuelPrice.value
      );


    const liters =
      Number(
        fuelLiters.value
      );


    const odometer =
      Number(
        odometerInput.value
      );


    if (price <= 0) {

      alert(
        "กรุณากรอกราคาน้ำมันให้ถูกต้อง"
      );

      return;

    }


    if (liters <= 0) {

      alert(
        "กรุณากรอกจำนวนลิตรให้ถูกต้อง"
      );

      return;

    }


    if (odometer < 0) {

      alert(
        "กรุณากรอกเลขไมล์ให้ถูกต้อง"
      );

      return;

    }


    const record = {

      id:
        Date.now(),

      vehicle:
        fuelVehicle.value,

      date:
        fuelDate.value,

      price,

      liters,

      odometer,

      total:
        price * liters

    };


    records.push(record);


    saveRecords();


    fuelForm.reset();


    setTodayDate();


    fuelVehicle.value =
      vehicleSelect.value;


    costPreview.textContent =
      "฿0.00";


    fuelModal.classList.remove(
      "show"
    );


    updateSummary();

  }
);


/* =========================
   ประวัติการเติม
========================= */

function renderHistory() {

  const vehicle =
    vehicleSelect.value;


  const vehicleRecords =
    records
      .filter(
        record =>
          record.vehicle ===
          vehicle
      )
      .sort(
        (a, b) =>
          b.id - a.id
      );


  if (
    vehicleRecords.length === 0
  ) {

    fuelHistory.innerHTML = `
      <div class="glass empty-state">
        ยังไม่มีข้อมูลการเติมน้ำมัน
      </div>
    `;


    return;

  }


  fuelHistory.innerHTML =
    vehicleRecords
      .slice(0, 5)
      .map(
        record => `
          <div class="glass history-item">

            <div>

              <strong>
                ${formatDate(
                  record.date
                )}
              </strong>

              <p>
                ${Number(
                  record.liters
                ).toFixed(2)}
                ลิตร ·

                ${Number(
                  record.odometer
                ).toLocaleString(
                  "th-TH"
                )}
                km
              </p>

            </div>


            <div class="history-cost">

              <strong>
                ฿${Number(
                  record.total
                ).toLocaleString(
                  "th-TH",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }
                )}
              </strong>

              <span>
                ฿${Number(
                  record.price
                ).toFixed(2)}/L
              </span>

            </div>

          </div>
        `
      )
      .join("");

}


/* =========================
   Dashboard รายเดือน
========================= */

function updateSummary() {

  const vehicle =
    vehicleSelect.value;


  /*
    ข้อมูลทั้งหมดของรถ
    เรียงตามวันที่และเลขไมล์
  */

  const allVehicleRecords =
    records
      .filter(
        record =>
          record.vehicle ===
          vehicle
      )
      .sort(
        (a, b) => {

          const dateA =
            new Date(
              a.date +
              "T00:00:00"
            );


          const dateB =
            new Date(
              b.date +
              "T00:00:00"
            );


          if (
            dateA - dateB !== 0
          ) {

            return (
              dateA - dateB
            );

          }


          if (
            Number(
              a.odometer
            ) !==
            Number(
              b.odometer
            )
          ) {

            return (
              Number(
                a.odometer
              ) -
              Number(
                b.odometer
              )
            );

          }


          return (
            Number(a.id) -
            Number(b.id)
          );

        }
      );


  /* เดือนปัจจุบัน */

  const now =
    new Date();


  const currentMonth =
    now.getMonth();


  const currentYear =
    now.getFullYear();


  /*
    เฉพาะรายการในเดือนนี้
  */

  const monthlyRecords =
    allVehicleRecords.filter(
      record => {

        const recordDate =
          new Date(
            record.date +
            "T00:00:00"
          );


        return (
          recordDate.getMonth() ===
            currentMonth &&

          recordDate.getFullYear() ===
            currentYear
        );

      }
    );


  /* ค่าใช้จ่ายเดือนนี้ */

  const totalCost =
    monthlyRecords.reduce(
      (sum, record) =>
        sum +
        Number(
          record.total || 0
        ),
      0
    );


  /* น้ำมันเดือนนี้ */

  const totalLiters =
    monthlyRecords.reduce(
      (sum, record) =>
        sum +
        Number(
          record.liters || 0
        ),
      0
    );


  /*
    คำนวณระยะทางและ km/L

    ตัวอย่าง

    ครั้งก่อน
    10,000 km

    ครั้งล่าสุด
    10,500 km
    เติม 40 ลิตร

    ระยะทาง = 500 km

    km/L =
    500 ÷ 40
    = 12.5 km/L
  */

  let monthlyDistance = 0;

  let litersForEfficiency = 0;


  allVehicleRecords.forEach(
    (record, index) => {

      if (index === 0) {

        return;

      }


      const recordDate =
        new Date(
          record.date +
          "T00:00:00"
        );


      const isCurrentMonth =
        recordDate.getMonth() ===
          currentMonth &&

        recordDate.getFullYear() ===
          currentYear;


      if (!isCurrentMonth) {

        return;

      }


      const previousRecord =
        allVehicleRecords[
          index - 1
        ];


      const distance =
        Number(
          record.odometer
        ) -
        Number(
          previousRecord.odometer
        );


      if (distance > 0) {

        monthlyDistance +=
          distance;


        litersForEfficiency +=
          Number(
            record.liters || 0
          );

      }

    }
  );


  const efficiency =
    litersForEfficiency > 0

      ? monthlyDistance /
        litersForEfficiency

      : 0;


  /* ค่าใช้จ่าย */

  document.getElementById(
    "monthlyCost"
  ).textContent =
    `฿${totalCost.toLocaleString(
      "th-TH",
      {
        maximumFractionDigits: 0
      }
    )}`;


  /* น้ำมัน */

  document.getElementById(
    "monthlyLiters"
  ).textContent =
    `${totalLiters.toFixed(1)} L`;


  /* ระยะทาง */

  document.getElementById(
    "monthlyDistance"
  ).textContent =
    `${monthlyDistance.toLocaleString(
      "th-TH"
    )} km`;


  /* km/L */

  document.getElementById(
    "fuelEfficiency"
  ).textContent =
    `${efficiency.toFixed(1)} km/L`;


  renderHistory();

}


/* =========================
   แสดงวันที่แบบไทย
========================= */

function formatDate(date) {

  return new Date(
    date + "T00:00:00"
  ).toLocaleDateString(
    "th-TH",
    {
      day: "numeric",
      month: "short",
      year: "2-digit"
    }
  );

}


/* =========================
   เริ่มต้นแอป
========================= */

saveVehicles();

renderVehicles();

updateSummary();