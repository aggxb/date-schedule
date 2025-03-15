const initAddDate = () => {
  const dateListElement = document.querySelector('.date-list');
  const dateForm = document.querySelector('.date-form');
  const dateDisplay = document.querySelector('#date-display span');
  let dateArray = [];

  const getRemainingDays = (date) => {
    const actualDate = new Date().getTime();
    const futureDate = new Date(date).getTime();

    const remainingDays = Math.ceil(
      (futureDate - actualDate) / (1000 * 60 * 60 * 24),
    );

    return remainingDays;
  };

  const setLocalDates = (dateArray) => {
    const jsonDateArray = JSON.stringify(dateArray);

    localStorage.setItem('dates', jsonDateArray);
  };

  const setDate = (dateName, dateInfo, date) => {
    const { dateArray } = getDates();
    dateArray.push({
      id: Date.now(),
      name: dateName,
      date: dateInfo,
      remainingDays: getRemainingDays(date),
    });

    setLocalDates(dateArray);
  };

  const getDates = () => {
    const localDatesJson = localStorage.getItem('dates');
    dateArray = JSON.parse(localDatesJson) || [];

    return { localDatesJson, dateArray };
  };

  const createDateElement = () => {
    dateListElement.innerHTML = '';
    const { dateArray } = getDates();

    dateArray.forEach(({ name, date, remainingDays }) => {
      const dateItemElement = document.createElement('li');
      dateItemElement.classList.add('date-item');

      dateItemElement.innerHTML = `
        <div class="date-item-info">
          <h3>${name}</h3>
          <div>
            <p>${date}</p>
            ${
              remainingDays > 0
                ? `<p>Faltam <span class="remaining-days-counter">${remainingDays}</span> dias</p>`
                : `<p class="remaining-days-counter">Chegou o dia :)</p>`
            }
          </div>
        </div>
        <div class="date-functions">
          <a href="/" class="edit-date" aria-label="Editar esta data"><i class="fa-solid fa-pencil"></i></a>
          <button class="delete-date" aria-label="Excluir esta data"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;

      dateListElement.appendChild(dateItemElement);
    });
  };

  const errorMsg = document.querySelector('#error-msg');

  const validateInput = (inputs, actualDate) => {
    inputs.forEach((input) => (input.style.borderColor = 'transparent'));
    const invalidInputs = inputs.filter(
      (input) =>
        !input.value ||
        (input.id === 'date' && new Date(input.value) <= actualDate),
    );

    if (invalidInputs.length) {
      errorMsg.style.display = 'block';

      invalidInputs.forEach((input) => {
        input.style.borderColor = 'red';

        if (input.id === 'name' && !input.value) {
          input.addEventListener('change', () => {
            if (input.value) {
              input.style.borderColor = 'transparent';
            } else {
              input.style.borderColor = 'red';
            }
          });
        }

        if (input.id === 'date' && !input.value) {
          input.addEventListener('change', () => {
            const inputDate = new Date(input.value);

            if (input.value && actualDate < inputDate) {
              input.style.borderColor = 'transparent';
            } else {
              input.style.borderColor = 'red';
            }
          });
        }
      });

      return false;
    } else {
      errorMsg.style.display = 'none';

      return true;
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const dateNameInput = event.target[0];
    const dateInput = event.target[1];
    const dateName = dateNameInput.value;
    const date = dateInput.value;

    const actualDate = new Date();

    const validateResult = validateInput(
      [dateNameInput, dateInput],
      actualDate,
    );

    const modal = event.target.parentElement.parentElement;

    const form = event.target;

    if (validateResult && dateArray.length < 5) {
      dateInput.style.borderColor = 'transparent';
      errorMsg.style.display = 'none';

      const dateParts = date.split('-');
      const dateInfo = new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2],
      ).toLocaleDateString();

      setDate(dateName, dateInfo, date);
      createDateElement();

      modal.close();
      cleanForm(form);
    } else if (dateArray.length >= 5) {
      errorMsg.innerHTML = 'A agenda atingiu o número máximo de datas';
      errorMsg.style.display = 'block';
    }
  };

  const getTimeUntilMidnight = () => {
    const actualTime = new Date();
    const nextMidnight = new Date(
      actualTime.getFullYear(),
      actualTime.getMonth(),
      actualTime.getDate() + 1,
      0,
      0,
      0,
      0,
    );

    const remainingTime = nextMidnight.getTime() - actualTime.getTime();

    return remainingTime;
  };

  const updateDatesInfo = () => {
    const { dateArray } = getDates();
    const lastUpdate = new Date(localStorage.getItem('lastUpdate'));
    const today = new Date();
    const daysPassed = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));

    const updatedDateArray = dateArray
      .map((date) => {
        return {
          ...date,
          remainingDays: date.remainingDays - daysPassed,
        };
      })
      .filter(({ remainingDays }) => remainingDays >= 0);

    setLocalDates(updatedDateArray);
    createDateElement();
  };

  let dailyUpdateTimeout;

  const startDailyUpdate = () => {
    clearTimeout(dailyUpdateTimeout);
    dailyUpdateTimeout = setTimeout(() => {
      updateDatesInfo();
      startDailyUpdate();
    }, getTimeUntilMidnight());
  };

  const cleanForm = (form) => {
    const formInputs = form.querySelectorAll('.date-form-input input');

    formInputs.forEach((input) => {
      input.value = '';
    });
  };

  createDateElement();

  const updateDates = () => {
    const lastUpdate = localStorage.getItem('lastUpdate');
    const todayISO = new Date().toISOString().split('T')[0];

    const todayLocaleString = new Date().toLocaleDateString();
    dateDisplay.innerText = todayLocaleString;

    if (lastUpdate !== todayISO) {
      updateDatesInfo();
      localStorage.setItem('lastUpdate', todayISO);
    }
  };

  updateDates();
  startDailyUpdate();

  dateForm.addEventListener('submit', handleSubmit);
};

export default initAddDate;
