const fuelModal =
  document.getElementById("fuelModal");

const openFuelModal =
  document.getElementById("openFuelModal");

const closeFuelModal =
  document.getElementById("closeFuelModal");

const fuelForm =
  document.getElementById("fuelForm");

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

const currentVehicle =
  document.getElementById("currentVehicle");

let records =
  JSON.parse(
    localStorage.getItem("fuelRecords")
  ) || [];


/* -----------------------------
   วันที่เริ่มต้น
------------------------------ */

const fuelDate =
  document.getElementById("fuelDate");

fuelDate.value =
  new Date()
    .toISOString()
    .split("T")[0];


/* -----------------------------
   Modal
------------------------------ */

openFuelModal.addEventListener(
  "click",
  () => {

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
  .querySelector(".modal-backdrop")
  .addEventListener(
    "click",
    () => {

      fuelModal.classList.remove("show");

    }
  );


/* -----------------------------
   คำนวณราคาน้ำมัน
------------------------------ */

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


/* -----------------------------
   เลือกรถ
------------------------------ */

vehicleSelect.addEventListener(
  "change",
  () => {

    currentVehicle.textContent =
      vehicleSelect.value;

    document.getElementById(
      "fuelVehicle"
    ).value =
      vehicleSelect.value;

    updateSummary();

  }
);


/* -----------------------------
   บันทึกข้อมูล
------------------------------ */

fuelForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();

    const price =
      Number(
        document.getElementById(
          "fuelPrice"
        ).value
      );

    const liters =
      Number(
        document.getElementById(
          "fuelLiters"
        ).value
      );

    const record = {

      id: Date.now(),

      vehicle:
        document.getElementById(
          "fuelVehicle"
        ).value,

      date:
        document.getElementById(
          "fuelDate"
        ).value,

      price,

      liters,

      odometer:
        Number(
          document.getElementById(
            "odometer"
          ).value
        ),

      total:
        price * liters

    };


    records.push(record);


    localStorage.setItem(
      "fuelRecords",
      JSON.stringify(records)
    );


    fuelForm.reset();


    fuelDate.value =
      new Date()
        .toISOString()
        .split("T")[0];


    costPreview.textContent =
      "฿0.00";


    fuelModal
      .classList
      .remove("show");


    renderHistory();

    updateSummary();

  }
);


/* -----------------------------
   แสดงประวัติ
------------------------------ */

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
                ${formatDate(record.date)}
              </strong>

              <p>
                ${record.liters.toFixed(2)}
                ลิตร ·
                ${record.odometer.toLocaleString()}
                km
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


/* -----------------------------
   Dashboard
------------------------------ */

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


  if (
    vehicleRecords.length >= 2
  ) {

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


updateSummary();