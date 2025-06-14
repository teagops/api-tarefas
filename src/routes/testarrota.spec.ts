import "dotenv/config";
import supertest from "supertest"
import {app} from "../app"
import { create } from "../service/user/create/create-user";
import { db } from "../config/connect";

let usuarioToken: string;
let usuario2Token: string;
const usuario = {
                    id : 0,
                    nome : "Teste",
                    email : "teste@email",
                    senha : "senha123"
                };

const usuario2 = {
                    id: 1,
                    nome : "Teste2",
                    email : "teste2@email",
                    senha : "senha122"
                }

let url_usuario: string;
let tarefas : any[];
let tarefas_id : number[] = [];


describe("Testar as rotas de usuario",()=>{
    it("Iniciar",async()=>{
        const response = await supertest(app).get("/");

        await db.query("DELETE FROM tarefa; DELETE FROM lista_tarefa; DELETE FROM usuario");
        

        expect(response.status).toBe(200);
    });
    it("Criar usuario",async()=>{
        const response = await supertest(app)
        .post("/create/user")
        .send(usuario)    
        url_usuario = response.body.Email;
        expect(response.status).toBe(201);
    });
    it("Login",async()=>{
        const response = await supertest(app)
        .post("/login")
        .send({
            email: usuario.email,
            senha: usuario.senha
        });
        
        

        usuario.id = response.body.user.id;
        usuarioToken = response.body.token;
        expect(response.status).toBe(200);
        expect(response.body.user.nome).toBe(usuario.nome);
        expect(response.body.user.email).toBe(usuario.email);
    });
    it("Validando usuario",async()=>{
        const response = await supertest(app).
        get("/valid/" + url_usuario.split("/")[4]);
        
        expect(response.status).toBe(200);
    });

});

describe("Testar as rotas das tarefas",()=>{
    it("Criar lista de tarefas",async()=>{
        

        const response = await supertest(app).
        post("/create/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            nome:"Lista Tarefas 1",
            usuario_id : usuario.id
        });


        expect(response.status).toBe(200);
    });
    it("Ver as lista de tarefas",async()=>{
        const response = await supertest(app).
        get("/select/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            usuario_id : usuario.id
        });
        tarefas = response.body;

        expect(response.status).toBe(200);

    });
    it("Adicionar tarefa",async()=>{
        const response = await supertest(app).
        post("/create/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            titulo:"Tarefa A1",
            descricao:"Descricao da tarefa",
            data_tarefa:"01/01/2020",
            prioridade:"Alta",
            concluida:true,
            lista_tarefa_id:tarefas[0].id
        });
        
        expect(response.status).toBe(200);
    });
    it("Adicionar tarefa sem descrição",async()=>{
        const response = await supertest(app).
        post("/create/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            titulo:"Tarefa B1",
            data_tarefa:"01/02/2020",
            prioridade:"Alta",
            concluida:true,
            lista_tarefa_id:tarefas[0].id
        });
        
        expect(response.status).toBe(200);
    
    });
    it("Listar tarefas de uma lista",async()=>{
        const response = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        tarefas_id.push(...(response.body as any[]).map(x => x.id) as number[]);
        
        expect(response.status).toBe(200);
        expect(response.body[0].titulo).toBe("Tarefa A1");
        expect(response.body[1].descricao).toBe(null);
        expect((response.body as any[]).length).toBe(2);
    });
    it("Deletar tarefa",async()=>{
        
        const response1 = await supertest(app).
        delete("/delete/one/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            tarefa_id : tarefas_id[0]
        });
        expect(response1.status).toBe(200);
        const response2 = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        
        expect((response2.body as any[]).length).toBe(1);
        expect(response2.body[0].titulo).toBe("Tarefa B1");
    });
    it("Mudar título",async()=>{
        const responsetasksbefore = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        const responsetitulo = await supertest(app).
        patch("/update/task/title").set("authorization",`Bearer ${usuarioToken}`).
        send({
            titulo:"Título diferente 565656",
            tarefa_id:responsetasksbefore.body[0].id
        });
        const responsetasksafter = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        expect(responsetasksafter.body[0].titulo).toBe("Título diferente 565656")
    });
    it("Mudar descrição",async()=>{
        const responsetasksbefore = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        const responsedescription = await supertest(app).
        patch("/update/task/description").set("authorization",`Bearer ${usuarioToken}`).
        send({
            descricao:"Descrição de como fazer diferente",
            tarefa_id:responsetasksbefore.body[0].id
        });
        const responsetasksafter = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        expect(responsetasksafter.body[0].descricao).toBe("Descrição de como fazer diferente")
    });
    it("Mudar prioridade",async()=>{
        const responsetasksbefore = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        const responsepriority = await supertest(app).
        patch("/update/task/priority").set("authorization",`Bearer ${usuarioToken}`).
        send({
            prioridade:"Media",
            tarefa_id:responsetasksbefore.body[0].id
        });
        const responsetasksafter = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        expect(responsetasksafter.body[0].prioridade).toBe("Media")
    });
    it("Prioridade inválida",async()=>{
        const responsetasksbefore = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        const responsepriority = await supertest(app).
        patch("/update/task/priority").set("authorization",`Bearer ${usuarioToken}`).
        send({
            prioridade:"Nada",
            tarefa_id:responsetasksbefore.body[0].id
        });
        expect(responsepriority.status).toBe(406);
    });
    it("Mudar status de concluida",async()=>{
        const responsetasksbefore = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        const responseconcluida = await supertest(app).
        patch("/update/task/concluida").set("authorization",`Bearer ${usuarioToken}`).
        send({
            concluida:false,
            tarefa_id:responsetasksbefore.body[0].id
        });
        expect(responseconcluida.status).toBe(200);
        const responsetasksafter = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        expect(responsetasksafter.body[0].concluida).toBe(false)
        const responseconcluida2 = await supertest(app).
        patch("/update/task/concluida").set("authorization",`Bearer ${usuarioToken}`).
        send({
            concluida:true,
            tarefa_id:responsetasksbefore.body[0].id
        });
        const responsetasksafter2 = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        expect(responsetasksafter2.body[0].concluida).toBe(true)
    });
    it("Mudar data",async()=>{
        const responsetasksbefore = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        const responsedate = await supertest(app).
        patch("/update/task/date").set("authorization",`Bearer ${usuarioToken}`).
        send({
            data_tarefa:"06/25/2023",
            tarefa_id:responsetasksbefore.body[0].id
        });
        const responsetasksafter = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        expect((responsetasksafter.body[0].data_tarefa as string).split("T")[0]).toBe("2023-06-25")
    });
    it("Mudar título da lista",async()=>{
        const responselisttasksbefore = await supertest(app).
        get("/select/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            usuario_id : usuario.id
        });
        const responsetitulo = await supertest(app).
        patch("/update/list/task/title").set("authorization",`Bearer ${usuarioToken}`).
        send({
            nome:"Outra lista",
            lista_tarefa_id:responselisttasksbefore.body[0].id
        });
        const responsetasksafter = await supertest(app).
        get("/select/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            usuario_id : usuario.id
        });
        expect(responsetasksafter.body[0].nome).toBe("Outra lista")
    });
    /*
    it("Deletar todas as tarefa",async()=>{
        const response1 = await supertest(app).
        delete("/delete/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        expect(response1.status).toBe(200);
        const response2 = await supertest(app).
        get("/select/all/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            lista_tarefa_id:tarefas[0].id
        });
        expect((response2.body as any[]).length).toBe(0);
    });
    
    it("Deletar uma lista de tarefas", async()=>{
        //Criando listas e tarefas de teste
        const responsecreatelist = await supertest(app).
        post("/create/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            nome:"Lista Tarefas 33",
            usuario_id : usuario.id
        });
        const responseselectlist = await supertest(app).
        get("/select/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            usuario_id : usuario.id
        });
        
        const responsecreatetask1 = await supertest(app).
        post("/create/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            titulo:"Tarefa AAA33",
            descricao:"Descricao da tarefa 3333",
            data_tarefa:"02/02/2022",
            prioridade:"Baixa",
            concluida:false,
            lista_tarefa_id:responseselectlist.body[1].id
        });

        const responsecreatetask2 = await supertest(app).
        post("/create/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            titulo:"Tarefa A1",
            descricao:"Descricao da tarefa",
            data_tarefa:"01/01/2020",
            prioridade:"Alta",
            concluida:true,
            lista_tarefa_id:responseselectlist.body[0].id
        });
        expect(responsecreatelist.status).toBe(200);
        expect(responsecreatetask1.status).toBe(200);
        expect(responsecreatetask2.status).toBe(200);
        //Deletar a primeira lista
        const responsedeletetask1 = await supertest(app).
        delete("/delete/one/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            id:responseselectlist.body[0].id
        });
        expect(responsedeletetask1.status).toBe(200);
        //Verificar se a lista que sobrou foi a outra
        const responseselectlist2 = await supertest(app).
        get("/select/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            usuario_id : usuario.id
        });
        expect((responseselectlist2.body as any[]).length).toBe(1);
        expect(responseselectlist2.body[0].id).toBe(responseselectlist.body[1].id);
    });
    it("Deletar todas as listas de tarefas", async()=>{
        const responsecreatelist = await supertest(app).
        post("/create/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            nome:"Lista Tarefas 34",
            usuario_id : usuario.id
        });
        const responseselectlist = await supertest(app).
        get("/select/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            usuario_id : usuario.id
        });
        
        const responsecreatetask1 = await supertest(app).
        post("/create/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            titulo:"Tarefa AAA34",
            descricao:"Descricao da tarefa 3553",
            data_tarefa:"03/02/2022",
            prioridade:"Baixa",
            concluida:false,
            lista_tarefa_id:responseselectlist.body[1].id
        });

        const responsecreatetask2 = await supertest(app).
        post("/create/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            titulo:"Tarefa A21",
            descricao:"Descricao da tarefa",
            data_tarefa:"01/02/2020",
            prioridade:"Alta",
            concluida:true,
            lista_tarefa_id:responseselectlist.body[0].id
        });
        expect(responsecreatelist.status).toBe(200);
        expect(responsecreatetask1.status).toBe(200);
        expect(responsecreatetask2.status).toBe(200);

        //Deletar todas as listas
        const responsedeletealltask = await supertest(app).
        delete("/delete/all/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            usuario_id:usuario.id
        });
        expect(responsedeletealltask.status).toBe(200);

        //Ver se a lista está vazia
        const responseselectlist2 = await supertest(app).
        get("/select/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            usuario_id : usuario.id
        });
        expect((responseselectlist2.body as any[]).length).toBe(0);
    });*/
});
/*
describe("Testar erro de acesso",()=>{
    it("Erro ao fazer login com senha errada", async()=>{
        const response = await supertest(app)
        .post("/login")
        .send({
            email: usuario.email,
            senha: "senha124"
        });

        expect(response.status).toBe(401);
    });
    it("Erro ao fazer login com email errado", async()=>{
        const response = await supertest(app)
        .post("/login")
        .send({
            email: "teste2@email",
            senha: usuario.senha
        });

        expect(response.status).toBe(401);
    });
    it("Ação de usuario com email invalido",async()=>{
        const responsecadastro = await supertest(app)
        .post("/create/user")
        .send(usuario2); 
        const responselogin = await supertest(app)
        .post("/login")
        .send({
            email: usuario2.email,
            senha: usuario2.senha
        });
        usuario2.id=responselogin.body.user.id
        const responseacao = await supertest(app).
        post("/create/list/task").set("authorization",`Bearer ${responselogin.body.token}`).
        send({
            nome:"Lista Tarefas 5",
            usuario_id : responselogin.body.id
        });
        
        expect(responseacao.status).toBe(401);
        expect(responseacao.body.Erro).toBe("Erro de validação");
    });
    it("Barrar ação de usuario em tareda de outro usuario",async()=>{
        const responseacao = await supertest(app).
        post("/create/list/task").set("authorization",`Bearer ${usuarioToken}`).
        send({
            nome:"Lista Tarefas 5",
            usuario_id : usuario2.id
        });
        expect(responseacao.status).toBe(401);
        //expect(responseacao.body.Erro).toBe("Usuario errado");
    });
});*/