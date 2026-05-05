export const buildNeedItems = (items, id_pedido) =>
  items.map((item) => ({
    id_pedido,
    tipo_bem_servico: item.tipo_bem_servico,
    publico: item.publico,
  }));
