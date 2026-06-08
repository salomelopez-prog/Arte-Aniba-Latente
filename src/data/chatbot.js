export const quickQuestions = [
  'Precios', 'Envíos', 'Materiales', 'Pagos',
  'Historia', 'Comino crespo', 'Proceso', 'WhatsApp',
]

export const getBotAnswer = (message) => {
  const msg = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  // Saludos
  if (msg.includes('hola') || msg.includes('buenas') || msg.includes('hey') || msg.includes('saludos')) {
    return 'Hola, soy el asistente de Arte Aniba. Puedo ayudarte con precios, envios, materiales, historia del taller, formas de pago y mas. Preguntame lo que necesites.'
  }

  // Precios
  if (msg.includes('precio') || msg.includes('cuanto') || msg.includes('cuanto cuesta') || msg.includes('valor') || msg.includes('costar')) {
    return 'Nuestras piezas van desde $20.000 COP (dijes) hasta $720.000 COP (hongos de 50 cm). En el catalogo puedes filtrar por categoria y ver los precios de cada referencia. Los precios pueden variar segun el tamano y la complejidad de cada pieza.'
  }

  // Envíos
  if (msg.includes('envio') || msg.includes('domicilio') || msg.includes('envian') || msg.includes('enviamos') || msg.includes('llega') || msg.includes('entrega')) {
    return 'Hacemos envios a toda Colombia por Interrapidisimo (3-4 dias habiles). Para Medellin y alrededores tenemos servicio de mensajeria local con entregas mas rapidas segun disponibilidad. El costo del envio se calcula segun el destino y se confirma antes de finalizar.'
  }

  // Materiales
  if (msg.includes('material') || msg.includes('comino') || msg.includes('madera') || msg.includes('comino crespo') || msg.includes('aniba')) {
    return 'Trabajamos con raices recuperadas de comino crespo (Aniba), un arbol de crecimiento lento que puede tardar hasta 250 anos en madurar. Usamos raices de talas de 70-100 anos recuperadas de bosques locales de San Rafael, Antioquia. Tambien usamos matraton y cedro recuperado sosteniblemente para arboles decorativos. Sin lacas ni colorantes artificiales.'
  }

  // Pagos
  if (msg.includes('pago') || msg.includes('tarjeta') || msg.includes('nequi') || msg.includes('daviplata') || msg.includes('bold') || msg.includes('transferencia')) {
    return 'Aceptamos tarjetas de credito y debito (a traves de Bold), Nequi, DaviPlata, BanColombia, Nubank y transferencias bancarias. La comision del banco se cobra al cliente. Al finalizar tu compra, recibiras un enlace de pago seguro.'
  }

  // Historia
  if (msg.includes('historia') || msg.includes('familia') || msg.includes('inicio') || msg.includes('comenzo') || msg.includes('taller')) {
    return 'Arte Aniba nacio como un proyecto familiar en la Vereda El Arenal, San Rafael, Antioquia. Detras de cada pieza esta Dona Luz (33 anos), quien atiende clientes y redes sociales, y su esposo (42 anos), liderando la produccion. Somos un equipo de 3 personas administrativas, 1 operario permanente y una red de ~6 personas indirectas. Estamos en tramite de registro en Camara de Comercio y somos marca registrada ante la Superintendencia de Industria y Comercio.'
  }

  // Proceso
  if (msg.includes('proceso') || msg.includes('fabrica') || msg.includes('producen') || msg.includes('hacen') || msg.includes('como se hace')) {
    return 'Nuestro proceso tiene 4 etapas: 1) Recepcion de madera de proveedores locales y arrieros. 2) Despiece y seleccion: troncos grandes para piezas mayores, restos para piezas pequenas (hongos, corazones, hojas). 3) Fabricacion artesanal: sin moldes, sin lacas, cada pieza es unica. 4) Control de calidad: elegimos piezas con terminaciones especiales. Es economia circular pura.'
  }

  // WhatsApp - Contacto
  if (msg.includes('contacto') || msg.includes('whatsapp') || msg.includes('celular') || msg.includes('telefono') || msg.includes('llamar') || msg.includes('escribir')) {
    return 'Puedes escribirnos por WhatsApp al +57 313 7975713 (el boton verde de la esquina abre el chat directo). Tambien por email a arteaniba@gmail.com o por Instagram @arteaniba. Nuestro taller esta en la Vereda El Arenal, San Rafael, Antioquia, Colombia.'
  }

  // Ubicación
  if (msg.includes('ubicacion') || msg.includes('donde') || msg.includes('taller') || msg.includes('san rafael') || msg.includes('direccion')) {
    return 'Nuestro taller esta ubicado en la Vereda El Arenal, San Rafael, Antioquia, Colombia. Trabajamos con bosques locales de la region, recuperando raices de talas antiguas. No tenemos tienda fisica abierta al publico, pero coordinamos visitas con cita previa.'
  }

  // Productos / catálogo
  if (msg.includes('producto') || msg.includes('catalogo') || msg.includes('disponible') || msg.includes('tienen') || msg.includes('venden')) {
    return 'Tenemos 10 categorias de productos: Hongos decorativos (8-50 cm, $27.000-$720.000), Lamparas hongo ($260.000-$582.000), Hongos maceteros ($36.000), Candelabros con vela de cera de soya ($40.000-$80.000), Raices con hongos ($230.000-$420.000), Arboles decorativos ($48.000-$99.000), Corazones ($50.000-$315.000), Porta velas ($56.000), Dijes ($20.000) y Cuadros de hongos ($235.000).'
  }

  // Proyectos empresariales / hoteles
  if (msg.includes('hotel') || msg.includes('empresarial') || msg.includes('proyecto') || msg.includes('contrato') || msg.includes('mayorista')) {
    return 'Si, trabajamos proyectos empresariales y con hoteles. Un ejemplo destacado es un contrato con un hotel en Santa Fe de Antioquia para 136 lamparas y raices decorativas. Si representas un hotel, decorador o proyecto de interiorismo, escribenos por WhatsApp para coordinar una cotizacion personalizada.'
  }

  // Ferias
  if (msg.includes('feria') || msg.includes('expo') || msg.includes('artesanias') || msg.includes('evento') || msg.includes('exposicion')) {
    return 'Participamos en Expo Artesano (Medellin/Bogota), la feria artesanal mas importante de Colombia, en 2023. Tambien estamos atentos a convocatorias de Artesanias de Colombia, incluyendo los programas Exportesan y Exportesania para proyeccion internacional.'
  }

  // Unicidad de piezas
  if (msg.includes('unica') || msg.includes('unico') || msg.includes('diferente') || msg.includes('igual') || msg.includes('repetida') || msg.includes('medida') || msg.includes('varia')) {
    return 'Cada pieza de Arte Aniba es unica e irrepetible. No usamos moldes, por lo que las medidas, grietas, vetas y colores varian segun la naturaleza de cada raiz. Aunque dos piezas compartan la misma referencia (ej. Hongo 15 cm), los detalles de la madera las hacen diferentes. Esto es parte del valor artesanal de nuestro trabajo.'
  }

  // Comisión / recargos
  if (msg.includes('comision') || msg.includes('recargo') || msg.includes('cobra') || msg.includes('interes') || msg.includes('extra')) {
    return 'La comision del medio de pago se cobra al cliente, no la absorbemos nosotros. Esto aplica para tarjetas de credito, Nequi, DaviPlata y otros medios. El porcentaje varia segun el metodo de pago elegido.'
  }

  // Tiempos de entrega
  if (msg.includes('tiempo') || msg.includes('demora') || msg.includes('tarda') || msg.includes('cuando llega') || msg.includes('cuando') && msg.includes('llegar')) {
    return 'Los envios nacionales por Interrapidisimo toman de 3 a 4 dias habiles. Para Medellin y alrededores, tenemos mensajeria local con entregas mas rapidas. El tiempo de preparacion del pedido depende de la disponibilidad de la pieza. Te confirmamos los tiempos exactos antes de finalizar la compra.'
  }

  // Garantía / devoluciones
  if (msg.includes('garantia') || msg.includes('devolucion') || msg.includes('cambio') || msg.includes('reclamo') || msg.includes('retracto')) {
    return 'Al ser piezas artesanales unicas, no aceptamos cambios por variaciones naturales en grietas, vetas o tonos de la madera. Si tu pieza llega danada durante el transporte, contactanos dentro de las primeras 48 horas para evaluar el caso. Aplican los derechos de retracto segun la Ley 1480 de 2011 (Estatuto del Consumidor colombiano).'
  }

  // Instagram / redes
  if (msg.includes('instagram') || msg.includes('redes') || msg.includes('red social') || msg.includes('facebook') || msg.includes('siguenos')) {
    return 'Nos encuentras en Instagram como @arteaniba. Ahí publicamos nuestras piezas nuevas, procesos del taller y proyectos especiales. La mayoria de nuestros pedidos nuevos llegan a traves de Instagram.'
  }

  // Política de privacidad
  if (msg.includes('privacidad') || msg.includes('datos') || msg.includes('proteccion') || msg.includes('ley 1581') || msg.includes('habeas')) {
    return 'Cumplimos con la Ley 1581 de 2012 de Proteccion de Datos Personales en Colombia. Tus datos se usan unicamente para procesar tu pedido y comunicaciones relacionadas. No compartimos informacion con terceros sin tu consentimiento explicito.'
  }

  // Fallback
  return 'Puedo ayudarte con: precios de todas las categorias, envios nacionales y locales, materiales (comino crespo, mataratón, cedro), formas de pago (Bold, Nequi, DaviPlata, etc.), historia del taller, proceso productivo, ubicacion, proyectos empresariales, ferias, garantias y mas. Preguntame lo que quieras saber sobre Arte Aniba.'
}
