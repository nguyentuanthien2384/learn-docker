const editDialog = document.getElementById('edit-dialog');
const deleteDialog = document.getElementById('delete-dialog');

document.querySelectorAll('[data-edit]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('edit-form').action = `/todos/${link.dataset.id}/update`;
    const input = document.getElementById('edit-title');
    input.value = link.dataset.title;
    editDialog.showModal();
    input.select();
  });
});

document.querySelectorAll('[data-delete]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.getElementById('delete-form').action = `/todos/${btn.dataset.id}/delete`;
    document.getElementById('delete-title').textContent = btn.dataset.title;
    deleteDialog.showModal();
  });
});

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));
  // bấm ra ngoài hộp thoại thì đóng
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
});
