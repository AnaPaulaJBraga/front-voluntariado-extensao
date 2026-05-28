//validação de formulario

$(document).ready(function(){// quando o documento tiver pronto

    $('formulario').validate({//form inteiro está sobre a função de validação

        rules: {
            nome: {
                required: true
            },
            email: {
                required: true,
                email: true
            },
            senha: {
                required: true
            },
            confirmarSenha: {
                required: true
            }
        },//fecha rules

        //caso usuario deixe de preencher algo
    invalidHandler: function(e, validador){//acontecendo um erro, então acontecerá o seguinte:
        let camposIncorretos = validador.numberOfInvalids(); //atrelando o numero de INPUTS não preenchidos ao validador, colocando ambos numa variavel
        if(camposIncorretos){//se tiver o caso de algum INPUT não preenchido:
            alert(`Possui ${camposIncorretos} campos a serem preenchidos!`)
        }
    },

    //caso usuario preencher tudo
    submitHandler: function(form) {
        alert("Formulário enviado!")
    }

    })//fecha validacao
})