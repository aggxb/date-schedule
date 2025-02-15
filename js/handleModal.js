const initHandleModal = () => {
  const openModalBtn = document.querySelectorAll('.open-modal');

  const getModalInfo = (btn) => {
    const modalId = btn.getAttribute('date-modal');
    const modal = document.getElementById(modalId);

    return modal;
  };


  const handleOpenBtnClick = (btn) => {
    const modal = getModalInfo(btn);
    modal.showModal();

    modal.addEventListener('click', ({ target }) =>
      handleCloseModal(target, modal),
    );
  };

  const handleCloseModal = (target, modal) => {
    const closeModalBtn = modal.querySelector('.close-modal');

    if (target.parentElement === closeModalBtn || target === modal) {
      modal.close();
    }
  };

  openModalBtn.forEach((btn) => {
    btn.addEventListener('click', () => handleOpenBtnClick(btn));
  });
};

export default initHandleModal;
