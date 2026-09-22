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


      /* แก้ไข */

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


      /* ลบ */

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

          deleteVehicle(
            vehicle
          );

        }
      );


      actions.appendChild(
        editButton
      );


      actions.appendChild(
        deleteButton
      );


      item.appendChild(
        name
      );


      item.appendChild(
        actions
      );


      vehicleList.appendChild(
        item
      );

    }
  );

}


/* =========================
   ลบรถ
========================= */

function deleteVehicle(
  vehicle
) {

  if (
    vehicles.length === 1
  ) {

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


  vehicleNameInput.value =
    "";


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
   วันที่
========================= */

function setTodayDate() {

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  fuelDate.value =
    `${year}-${month}-${day}`;

}


setTodayDate();


/* =========================
   เตรียมฟอร์มเพิ่มน้ำมัน
========================= */

function prepareNewFuelRecord() {

  editingFuelId =
    null;


  fuelForm.reset();


  setTodayDate();


  fuelVehicle.value =
    vehicleSelect.value;


  costPreview.textContent =
    "฿0.00";


  fuelSubmitButton.textContent =
    "บันทึกข้อมูล";

}


/* =========================
   เปิดหน้าต่างเติมน้ำมัน
========================= */

openFuelModal.addEventListener(
  "click",
  () => {

    prepareNewFuelRecord();


    fuelModal.classList.add(
      "show"
    );

  }
);


/* =========================
   ปิดหน้าต่างเติมน้ำมัน
========================= */

function closeFuelWindow() {

  fuelModal.classList.remove(
    "show"
  );


  editingFuelId =
    null;


  fuelSubmitButton.textContent =
    "บันทึกข้อมูล";

}


closeFuelModal.addEventListener(
  "click",
  closeFuelWindow
);


document
  .querySelector(
    "#fuelModal .modal-backdrop"
  )
  .addEventListener(
    "click",
    closeFuelWindow
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
   บันทึก / แก้ไขน้ำมัน
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


    if (
      !fuelDate.value
    ) {

      alert(
        "กรุณาเลือกวันที่เติม"
      );

      return;

    }


    if (
      price <= 0
    ) {

      alert(
        "กรุณากรอกราคาน้ำมันให้ถูกต้อง"
      );

      return;

    }


    if (
      liters <= 0
    ) {

      alert(
        "กรุณากรอกจำนวนลิตรให้ถูกต้อง"
      );

      return;

    }


    if (
      odometer < 0
    ) {

      alert(
        "กรุณากรอกเลขไมล์ให้ถูกต้อง"
      );

      return;

    }


    const fuelData = {

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


    /* แก้ไขรายการเดิม */

    if (
      editingFuelId !== null
    ) {

      const index =
        records.findIndex(
          record =>
            Number(record.id) ===
            Number(editingFuelId)
        );


      if (
        index !== -1
      ) {

        records[index] = {

          ...records[index],

          ...fuelData

        };

      }

    }


    /* เพิ่มรายการใหม่ */

    else {

      records.push({

        id:
          Date.now(),

        ...fuelData

      });

    }


    saveRecords();


    closeFuelWindow();


    prepareNewFuelRecord();


    updateSummary();

  }
);


/* =========================
   เปิดรายการเพื่อแก้ไข
========================= */

function editFuelRecord(
  id
) {

  const record =
    records.find(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (!record) {

    return;

  }


  editingFuelId =
    Number(id);


  fuelVehicle.value =
    record.vehicle;


  fuelDate.value =
    record.date;


  fuelPrice.value =
    record.price;


  fuelLiters.value =
    record.liters;


  odometerInput.value =
    record.odometer;


  updateCostPreview();


  fuelSubmitButton.textContent =
    "บันทึกการแก้ไข";


  fuelModal.classList.add(
    "show"
  );

}


/* =========================
   ลบรายการน้ำมัน
========================= */

function deleteFuelRecord(
  id
) {

  const record =
    records.find(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (!record) {

    return;

  }


  const confirmed =
    confirm(
      `ต้องการลบรายการเติมน้ำมันวันที่ ${formatDate(record.date)} หรือไม่?`
    );


  if (!confirmed) {

    return;

  }


  records =
    records.filter(
      item =>
        Number(item.id) !==
        Number(id)
    );


  saveRecords();


  updateSummary();

}


/* =========================
   ประวัติการเติมน้ำมัน
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
          Number(b.id) -
          Number(a.id)
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
      .slice(
        0,
        5
      )
      .map(
        record => `

          <div
            class="glass history-item"
          >

            <div class="history-info">

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


            <div class="history-right">

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


              <div
                class="history-actions"
              >

                <button
                  type="button"
                  class="history-edit-button"
                  data-id="${record.id}"
                >
                  แก้ไข
                </button>


                <button
                  type="button"
                  class="history-delete-button"
                  data-id="${record.id}"
                >
                  ลบ
                </button>

              </div>

            </div>

          </div>

        `
      )
      .join("");

}


/* =========================
   ปุ่มแก้ไข / ลบ ในประวัติ
========================= */

fuelHistory.addEventListener(
  "click",
  event => {

    const editButton =
      event.target.closest(
        ".history-edit-button"
      );


    if (
      editButton
    ) {

      editFuelRecord(
        editButton.dataset.id
      );

      return;

    }


    const deleteButton =
      event.target.closest(
        ".history-delete-button"
      );


    if (
      deleteButton
    ) {

      deleteFuelRecord(
        deleteButton.dataset.id
      );

    }

  }
);


/* =========================
   Dashboard รายเดือน
========================= */

function updateSummary() {

  const vehicle =
    vehicleSelect.value;


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
              dateA -
              dateB
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


  const now =
    new Date();


  const currentMonth =
    now.getMonth();


  const currentYear =
    now.getFullYear();


  /* รายการของเดือนนี้ */

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


  /* ค่าใช้จ่าย */

  const totalCost =
    monthlyRecords.reduce(
      (sum, record) =>

        sum +
        Number(
          record.total || 0
        ),

      0
    );


  /* น้ำมัน */

  const totalLiters =
    monthlyRecords.reduce(
      (sum, record) =>

        sum +
        Number(
          record.liters || 0
        ),

      0
    );


  /* ระยะทาง + km/L */

  let monthlyDistance =
    0;


  let litersForEfficiency =
    0;


  allVehicleRecords.forEach(
    (record, index) => {

      if (
        index === 0
      ) {

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


      if (
        !isCurrentMonth
      ) {

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


      if (
        distance > 0
      ) {

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

    `${monthlyDistance.toLocaleString(
      "th-TH"
    )} km`;


  document.getElementById(
    "fuelEfficiency"
  ).textContent =

    `${efficiency.toFixed(1)} km/L`;


  renderHistory();

}


/* =========================
   วันที่ภาษาไทย
========================= */

function formatDate(
  date
) {

  return new Date(
    date +
    "T00:00:00"
  ).toLocaleDateString(
    "th-TH",
    {

      day:
        "numeric",

      month:
        "short",

      year:
        "2-digit"

    }
  );

}


/* =========================
   เริ่มแอป
========================= */

saveVehicles();

renderVehicles();

updateSummary();