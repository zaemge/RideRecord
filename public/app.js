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

let records =
  JSON.parse(localStorage.getItem("fuelRecords")) || [];

let vehicles =
  JSON.parse(localStorage.getItem("vehicles")) || [];

/* ดึงชื่อรถจากประวัติเก่ามารวมด้วย */
records.forEach(record => {
  if (record.vehicle && !vehicles.includes(record.vehicle)) {
    vehicles.push(record.vehicle);
  }
});

if (vehicles.length === 0) {
  vehicles = ["Honda Civic"];
}

let editingVehicle = null;


/* =========================
   ระบบรถ
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

function renderVehicles(selectedVehicle = null) {

  const oldSelected =
    selectedVehicle ||
    vehicleSelect.value ||
    vehicles[0];

  vehicleSelect.innerHTML = "";
  fuelVehicle.innerHTML = "";

  vehicles.forEach(vehicle => {

    const option1 = document.createElement("option");
    option1.value = vehicle;
    option1.textContent = vehicle;
    vehicleSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = vehicle;
    option2.textContent = vehicle;
    fuelVehicle.appendChild(option2);

  });

  if (vehicles.includes(oldSelected)) {
    vehicleSelect.value = oldSelected;
  }

  fuelVehicle.value = vehicleSelect.value;
  currentVehicle.textContent = vehicleSelect.value;

  renderVehicleList();
}


/* =========================
   หน้าจัดการรถ
========================= */

addVehicleButton.addEventListener("click", () => {

  editingVehicle = null;

  vehicleNameInput.value = "";
  saveVehicleButton.textContent = "เพิ่มรถ";

  renderVehicleList();

  vehicleModal.classList.add("show");

  setTimeout(() => {
    vehicleNameInput.focus();
  }, 100);

});


closeVehicleModal.addEventListener("click", () => {
  vehicleModal.classList.remove("show");
});


document
  .querySelector(".vehicle-backdrop")
  .addEventListener("click", () => {
    vehicleModal.classList.remove("show");
  });


saveVehicleButton.addEventListener("click", saveVehicle);


vehicleNameInput.addEventListener("keydown", event => {

  if (event.key === "Enter") {
    saveVehicle();
  }

});


function saveVehicle() {

  const newName =
    vehicleNameInput.value.trim();

  if (!newName) {
    alert("กรุณากรอกชื่อรถ");
    return;
  }


  /* เพิ่มรถใหม่ */
  if (editingVehicle === null) {

    if (vehicles.includes(newName)) {
      alert("มีรถชื่อนี้อยู่แล้ว");
      return;
    }

    vehicles.push(newName);

    saveVehicles();

    renderVehicles(newName);

    vehicleNameInput.value = "";

    vehicleModal.classList.remove("show");

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
    vehicles.indexOf(editingVehicle);

  if (index !== -1) {
    vehicles[index] = newName;
  }


  /* เปลี่ยนชื่อรถในประวัติน้ำมันด้วย */
  records = records.map(record => {

    if (record.vehicle === editingVehicle) {
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

  saveVehicleButton.textContent = "เพิ่มรถ";
  vehicleNameInput.value = "";

  renderVehicles(newName);

  updateSummary();
}


/* =========================
   รายการรถ
========================= */

function renderVehicleList() {

  vehicleList.innerHTML = "";

  vehicles.forEach(vehicle => {

    const item =
      document.createElement("div");

    item.className =
      "vehicle-list-item";


    const name =
      document.createElement("div");

    name.className =
      "vehicle-list-name";

    name.textContent =
      vehicle;


    const actions =
      document.createElement("div");

    actions.className =
      "vehicle-list-actions";


    const editButton =
      document.createElement("button");

    editButton.type =
      "button";

    editButton.className =
      "vehicle-edit-button";

    editButton.textContent =
      "แก้ไข";


    editButton.addEventListener(
      "click",
      () => {

        editingVehicle = vehicle;

        vehicleNameInput.value =
          vehicle;

        saveVehicleButton.textContent =
          "บันทึกการแก้ไข";

        vehicleNameInput.focus();

      }
    );


    const deleteButton =
      document.createElement("button");

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


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    item.appendChild(name);
    item.appendChild(actions);

    vehicleList.appendChild(item);

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
      item => item !== vehicle
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


  renderVehicles(vehicles[0]);

  updateSummary();

}


/* =========================
   เปลี่ยนรถ
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
   วันที่
========================= */

fuelDate.value =
  new Date()
    .toISOString()
    .split("T")[0];


/* =========================
   หน้าต่างเติมน้ำมัน
========================= */

openFuelModal.addEventListener(
  "click",
  () => {

    fuelVehicle.value =
      vehicleSelect.value;

    fuelModal.classList.add("show");

  }
);


closeFuelModal.addEventListener(
  "click",
  () => {

    fuelModal.classList.remove("show");

  }
);


document
  .querySelector("#fuelModal .modal-backdrop")
  .addEventListener(
    "click",
    () => {

      fuelModal.classList.remove("show");

    }
  );


/* =========================
   คำนวณยอดเติม
========================= */

function updateCostPreview() {

  const price =
    Number(fuelPrice.value) || 0;

  const liters =
    Number(fuelLiters.value) || 0;

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
   บันทึกน้ำมัน
========================= */

fuelForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const price =
      Number(fuelPrice.value);

    const liters =
      Number(fuelLiters.value);

    const odometer =
      Number(
        document.getElementById(
          "odometer"
        ).value
      );


    const record = {

      id: Date.now(),

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


    fuelDate.value =
      new Date()
        .toISOString()
        .split("T")[0];


    fuelVehicle.value =
      vehicleSelect.value;


    costPreview.textContent =
      "฿0.00";


    fuelModal.classList.remove("show");


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
          record.vehicle === vehicle
      )
      .sort(
        (a, b) =>
          b.id - a.id
      );


  if (vehicleRecords.length === 0) {

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
                ${formatDate(record.date)}
              </strong>

              <p>
                ${record.liters.toFixed(2)} ลิตร ·
                ${record.odometer.toLocaleString()} km
              </p>
            </div>

            <div class="history-cost">

              <strong>
                ฿${record.total.toLocaleString(
                  "th-TH",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }
                )}
              </strong>

              <span>
                ฿${record.price.toFixed(2)}/L
              </span>

            </div>

          </div>
        `
      )
      .join("");

}


/* =========================
   Dashboard
========================= */

function updateSummary() {

  const vehicle =
    vehicleSelect.value;


  const vehicleRecords =
    records
      .filter(
        record =>
          record.vehicle === vehicle
      )
      .sort(
        (a, b) =>
          a.odometer - b.odometer
      );


  const totalCost =
    vehicleRecords.reduce(
      (sum, record) =>
        sum + record.total,
      0
    );


  const totalLiters =
    vehicleRecords.reduce(
      (sum, record) =>
        sum + record.liters,
      0
    );


  let distance = 0;


  if (vehicleRecords.length >= 2) {

    distance =
      vehicleRecords[
        vehicleRecords.length - 1
      ].odometer
      -
      vehicleRecords[0].odometer;

  }


  const efficiency =
    totalLiters > 0
      ? distance / totalLiters
      : 0;


  document.getElementById(
    "monthlyCost"
  ).textContent =
    `฿${totalCost.toLocaleString(
      "th-TH",
      {
        maximumFractionDigits: 0
      }
    )}`;


  document.getElementById(
    "monthlyLiters"
  ).textContent =
    `${totalLiters.toFixed(1)} L`;


  document.getElementById(
    "monthlyDistance"
  ).textContent =
    `${distance.toLocaleString()} km`;


  document.getElementById(
    "fuelEfficiency"
  ).textContent =
    `${efficiency.toFixed(1)} km/L`;


  renderHistory();

}


function formatDate(date) {

  return new Date(date)
    .toLocaleDateString(
      "th-TH",
      {
        day: "numeric",
        month: "short",
        year: "2-digit"
      }
    );

}


/* =========================
   เริ่มแอป
========================= */

saveVehicles();
renderVehicles();
updateSummary();