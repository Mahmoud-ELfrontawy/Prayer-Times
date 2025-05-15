
let select = document.querySelector(".select");
let select_items = document.querySelectorAll(".select > ul > li");
let select_Array = Array.from(select_items);
let title = document.getElementById("title");
let settings = document.querySelector(".settings");

// القائمة المنسدلة
settings.addEventListener("click", (e) => {
    e.stopPropagation();
    settings.classList.toggle("rotate");
    select.classList.toggle("show");
});

document.addEventListener("click", () => {
    select.classList.remove("show");
});

// تحديث الوقت والتاريخ
function updateDateTime() {
    const now = new Date();

    const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    document.getElementById('time').textContent = now.toLocaleTimeString('en-US', timeOptions);

    const gregorianOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const gregorianDate = now.toLocaleDateString('ar-EG-u-ca-gregory', gregorianOptions);
    document.getElementById('gregorian-date').textContent = gregorianDate;

    const hijriOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const hijriDate = now.toLocaleDateString('ar-SA-u-ca-islamic', hijriOptions);
    document.getElementById('hijri-date').textContent = hijriDate;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// المدن
let cities = [
    { ar: "بني سويف", en: "Banī Suwayf" },
    { ar: "القاهرة", en: "Cairo" },
    { ar: "الإسكندرية", en: "Alexandria" },
    { ar: "الجيزة", en: "Giza" },
    { ar: "المنصورة", en: "Mansoura" },
];

// إضافة المدن للقائمة
for (let city of cities) {
    const content = `<li class="p-3 cursor-pointer hover:bg-gray-300" data-value="${city.en}">${city.ar}</li>`;
    document.getElementById("custom-city").innerHTML += content;
}

// التعامل مع اختيار المدينة
let cityListItems = document.querySelectorAll("#custom-city li");

cityListItems.forEach(item => {
    item.addEventListener("click", function () {
        let selectedCity = this.textContent;
        title.textContent = selectedCity;

        // تخزين المدينة في localStorage
        localStorage.setItem("selectedCity", selectedCity);

        let cityObj = cities.find(city => city.ar === selectedCity);
        if (cityObj) {
            getPrayersTimingsOfCity(cityObj.en);
        }
    });
});

// استرجاع المدينة من localStorage عند تحميل الصفحة
let savedCityAr = localStorage.getItem("selectedCity");

if (savedCityAr) {
    title.textContent = savedCityAr;
    let savedCityObj = cities.find(city => city.ar === savedCityAr);
    if (savedCityObj) {
        getPrayersTimingsOfCity(savedCityObj.en);
    }
} else {
    getPrayersTimingsOfCity("Banī Suwayf");
}

// جلب مواقيت الصلاة
function getPrayersTimingsOfCity(cityName) {
    let params = {
        country: "EG",
        city: cityName 
    }

    axios.get('https://api.aladhan.com/v1/timingsByCity', { params: params })
        .then(function (response) {
            const timings = response.data.data.timings;
            fillTimeForPrayer("fajr-time", timings.Fajr);
            fillTimeForPrayer("dhurh-time", timings.Dhuhr);
            fillTimeForPrayer("asr-time", timings.Asr);
            fillTimeForPrayer("sunset-time", timings.Maghrib);
            fillTimeForPrayer("isha-time", timings.Isha);
        })
        .catch(function (error) {
            console.log(error);
        });
}

// تحويل الوقت لـ 12 ساعة
function convertTo12HourFormat(time24) {
    let [hours, minutes] = time24.split(":");
    hours = parseInt(hours);
    let period = hours >= 12 ? "م" : "ص";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${period}`;
}

// تعبئة أوقات الصلاة
function fillTimeForPrayer(id, time24) {
    const time12 = convertTo12HourFormat(time24);
    document.getElementById(id).innerHTML = time12;
}


