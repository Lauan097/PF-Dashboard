# Importante

- Eu trabalho com websocket, usando a biblioteca socket.io, então ao criar a rota do dashboard pra o discord (bot), é importante conectar tudo corretamente, usando o socket.io/client que é exportado do arquivo socket.ts na pasta utils.
- Pra o banco, eu uso o Prisma, então sempre leia o schema.prisma pra ficar por dentro da estrutura do banco.
- O código do bot fica na pasta discord, e o do dashboard na dashboard.
- Se o código de uma página ficar muito grande (+800 linhas), considere dividir em componentes menores (isso também é válido para arquivos do websocket).
- Quando for criar um arquivo novo na parte do bot, sempre começe ele com "ws" e dentro da pasta wsServer.
- Sempre crie uma rota na api local do next pra chamar o websocket, nunca chame diretamente no frontend (exceto para rotas públicas do websocket que não contém informações sensíveis).
- Sempre opte por usar os Components V2 do Discord nas mensagens do bot, pois eles são mais bonitos! Aqui o link da documentação dos components v2 e dos novos modais do Discord: https://docs.discord.com/developers/components/reference
- Na UI eu uso a biblioteca HeroUI, então sempre opte por componentes dela. Documentação: https://heroui.com/docs/react/components
