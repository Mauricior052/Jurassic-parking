
export const menuOptions = (rol) => {
    const menu = [
    {
      title: 'Dashboard',
      icon: 'mdi mdi-gauge',
      submenu: [
        { title: 'Map', url: '/' },
        { title: 'Reservaciones', url: 'reservations' },
        { title: 'Estacionamientos', url: 'parkings' },
      ]
    },
    {
      title: 'Mantenimientos',
      icon: 'mdi mdi-folder-lock-open',
      submenu: [
        { title: 'Reviews', url: 'reviews' }
      ]
    }
  ];

  if (rol === 'admin') {
    menu[1].submenu.push({ title: 'Usuarios', url: 'usuarios' })
  }

  return menu

}
