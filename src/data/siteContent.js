// Contenido por defecto de las páginas editables (Inicio y Nosotros).
// Se usa como respaldo cuando la dueña aún no ha editado el contenido desde el admin,
// y como punto de partida del formulario de edición.

export const DEFAULT_ABOUT = {
  eyebrow: 'Nuestra historia',
  title: 'La raíz manda.',
  history: [
    'Arte Aniba es un taller familiar de San Rafael, Antioquia. Transformamos raíces recuperadas de comino crespo en objetos decorativos con carácter: hongos, lámparas, corazones, raíces, árboles, candelabros, cuadros y dijes.',
    'Detrás de cada pieza está Doña Luz (33 años), nuestro puente con clientes, redes sociales y distribuidores; su esposo (42 años), quien lidera la adquisición de madera y las operaciones del taller; y un equipo directo de 3 personas administrativas más 1 operario permanente, apoyados por una red indirecta de ~6 personas entre proveedores de madera, arrieros, transportistas y etiquetadores.',
  ],
  lead: 'El comino crespo (Aniba) puede tardar hasta 250 años en madurar. Por eso cada pieza exige respeto: no buscamos borrar su pasado, sino revelar la forma que ya trae escondida. Trabajamos con raíces de talas de 70 a 100 años (a veces más), recuperadas de bosques locales.',
  stats: [
    { value: '250+', label: 'años de maduración', text: 'El comino crespo es un árbol de crecimiento excepcionalmente lento.' },
    { value: '1/1', label: 'pieza irrepetible', text: 'Aunque dos referencias compartan nombre, ninguna sale igual. Grietas, vetas y tonos son únicos.' },
    { value: '2023', label: 'Expo Artesano', text: 'Participamos en la feria artesanal más importante de Colombia (Medellín/Bogotá).' },
    { value: '136', label: 'lámparas empresariales', text: 'Proyecto con hotel en Santa Fe de Antioquia: 136 lámparas + raíces decorativas.' },
  ],
  processEyebrow: 'Proceso productivo',
  processTitle: 'De la raíz al objeto.',
  steps: [
    { title: 'Recepción de madera', text: 'Proveedores locales y arrieros entregan raíces de comino crespo de talas de 70-100 años recuperadas de bosques de San Rafael, Antioquia.', detail: 'Comino crespo: árbol de crecimiento lento (~250 años para madurar)' },
    { title: 'Despiece y selección', text: 'Troncos grandes se destinan a piezas mayores como lámparas y esculturas. Los restos se aprovechan para crear hongos pequeños, corazones y hojas, evitando desperdicios.', detail: 'Economía circular: aprovechamiento total de la madera disponible' },
    { title: 'Fabricación artesanal', text: 'Sin moldes, sin lacas, sin colorantes artificiales. Cada pieza conserva grietas, vetas y colores propios de la madera. La forma final nace de leer la veta y la grieta natural de cada raíz.', detail: 'También usamos mataratón y cedro recuperado sosteniblemente' },
    { title: 'Control de calidad', text: 'Se eligen piezas con terminaciones especiales. Coordinamos disponibilidad, empaque y envío para que la pieza llegue lista para habitar el espacio.', detail: 'Proyecto empresarial destacado: 136 lámparas + raíces para hotel en Santa Fe de Antioquia' },
  ],
  valueTitle: 'Conexión entre la naturaleza, el arte, la libertad, la decoración y el ser.',
  value: [
    'Arte Aniba es un proyecto familiar que gira en torno a recuperar raíces de árboles que fueron talados o mutilados. No nos limitamos a estándares o moldes — cada pieza logra ser única, reflejando la esencia de la madera y las infinitas posibilidades que surgen cuando se permite que el material guíe el proceso creativo.',
    'Marca registrada ante la Superintendencia de Industria y Comercio. En trámite de inscripción en Cámara de Comercio. Convocatorias activas a través de Artesanías de Colombia (programas Exportesan y Exportesanía).',
  ],
}

// Combina el contenido guardado (JSON parseado) con los valores por defecto,
// para que cualquier campo que falte use el respaldo.
export const mergeAbout = (saved) => {
  if (!saved || typeof saved !== 'object') return DEFAULT_ABOUT
  return {
    ...DEFAULT_ABOUT,
    ...saved,
    stats: Array.isArray(saved.stats) && saved.stats.length ? saved.stats : DEFAULT_ABOUT.stats,
    steps: Array.isArray(saved.steps) && saved.steps.length ? saved.steps : DEFAULT_ABOUT.steps,
    history: Array.isArray(saved.history) && saved.history.length ? saved.history : DEFAULT_ABOUT.history,
    value: Array.isArray(saved.value) && saved.value.length ? saved.value : DEFAULT_ABOUT.value,
  }
}

// Parsea con seguridad un valor JSON de settings.
export const safeParse = (value, fallback) => {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return parsed
  } catch {
    return fallback
  }
}
