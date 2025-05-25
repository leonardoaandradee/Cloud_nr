/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         erro:
 *           type: boolean
 *         mensagem:
 *           type: string
 *   responses:
 *     NotFound:
 *       description: Recurso não encontrado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 * 
 * /clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Lista todos os clientes
 *     responses:
 *       200:
 *         description: Lista de clientes obtida com sucesso
 * 
 * /clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Busca um cliente por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         $ref: '#/components/responses/NotFound'
 * 
 *   put:
 *     tags: [Clientes]
 *     summary: Atualiza um cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 * 
 *   delete:
 *     tags: [Clientes]
 *     summary: Remove um cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente removido com sucesso
 * 
 * /clientes/{id}/historico:
 *   get:
 *     tags: [Clientes]
 *     summary: Busca histórico de pedidos do cliente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Histórico encontrado
 * 
 * /pedidos:
 *   post:
 *     tags: [Pedidos]
 *     summary: Cria um novo pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pedido'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 * 
 * /pedidos/{id}:
 *   put:
 *     tags: [Pedidos]
 *     summary: Atualiza status do pedido
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pendente, Em Preparo, Saiu para Entrega, Entregue, Cancelado]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 * 
 * /produtos:
 *   get:
 *     tags: [Produtos]
 *     summary: Lista todos os produtos
 *     responses:
 *       200:
 *         description: Lista obtida com sucesso
 * 
 *   post:
 *     tags: [Produtos]
 *     summary: Cria um novo produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 * 
 * /produtos/{id}:
 *   get:
 *     tags: [Produtos]
 *     summary: Busca um produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produto encontrado
 * 
 *   put:
 *     tags: [Produtos]
 *     summary: Atualiza um produto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Produto'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 */
