/*
  - Construa uma aplicação de conversão de moedas. O HTML e CSS são os que você
    está vendo no browser;
  - Você poderá modificar a marcação e estilos da aplicação depois. No momento, 
    concentre-se em executar o que descreverei abaixo;
    - Quando a página for carregada: 
      - Popule os <select> com tags <option> que contém as moedas que podem ser
        convertidas. "BRL" para real brasileiro, "EUR" para euro, "USD" para 
        dollar dos Estados Unidos, etc.
      - O option selecionado por padrão no 1º <select> deve ser "USD" e o option
        no 2º <select> deve ser "BRL";
      - O parágrafo com data-js="converted-value" deve exibir o resultado da 
        conversão de 1 USD para 1 BRL;
      - Quando um novo número for inserido no input com 
        data-js="currency-one-times", o parágrafo do item acima deve atualizar 
        seu valor;
      - O parágrafo com data-js="conversion-precision" deve conter a conversão 
        apenas x1. Exemplo: 1 USD = 5.0615 BRL;
      - O conteúdo do parágrafo do item acima deve ser atualizado à cada 
        mudança nos selects;
      - O conteúdo do parágrafo data-js="converted-value" deve ser atualizado à
        cada mudança nos selects e/ou no input com data-js="currency-one-times";
      - Para que o valor contido no parágrafo do item acima não tenha mais de 
        dois dígitos após o ponto, você pode usar o método toFixed: 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    - Para obter as moedas com os valores já convertidos, use a Exchange rate 
      API: https://www.exchangerate-api.com/;
      - Para obter a key e fazer requests, você terá que fazer login e escolher
        o plano free. Seus dados de cartão de crédito não serão solicitados.
*/

//obtendo a referência do objeto do DOM para conseguir altera-los
const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEl = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timeCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

let internalExchangeRate = {}

const getUrl = currency =>
 `https://v6.exchangerate-api.com/v6/c333797df7fe0c684d65b653/latest/${currency}`

const APIErrorMessages = {
  "unsupported-code": "Moeda não existe em nosso banco de dados.",
  "malformed-request": "O endpoint do seu request precisa seguir a estrutura a seguir: https://v6.exchangerate-api.com/v6/c333797df7fe0c684d65b653/latest/USD.",
  "invalid-key": "API Key não é válida!",
  "inactive-account": "Conta inativa!",
  "quota-reached": "Cota máxima de requisições atingida!",
  "generic": "Não foi possível obter as informações"
}

//função que retorna a descrição do erro de acordo com a chave passada
const getErrorMessage = errorType =>
  // se a chave passada não existir no objeto errorMessagesAPI, ou seja, for undefined,
  //então retorna "Não foi possivel..."
  //isto é chamaado de curto-circuito
  (APIErrorMessages)[errorType] || (APIErrorMessages)["generic"]

//método fetch() é usado para buscar dados externos... nesse caso é uma API
//fetch(url)
const fetchExchangeRate = async url => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Sua conexão falhou. Não foi possível obter as informações.')
    }
    const exchangeRateData = await response.json();

    if (exchangeRateData.result === 'error') {
      throw new Error(getErrorMessage(exchangeRateData['error-type']))
    }

    return exchangeRateData
  } catch (err) {
     // quando cria elementos no DOM com createElement eu consigo adicionar eventos nesse elemento
    // antes mesmo de ele ter sido inserido no DOM, porque esse elemento é um objeto
    // e a referência desse objeto será a mesma tanto no JS quanto no DOM quando for inserido lá
    const div = document.createElement('div')
    const button = document.createElement('button')

    //passa o valor da mensagem como conteúdo da div
    div.textContent = err.message
    //adiciona as classes na propriedade classe da div e do button
    div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fade', 'show')
    button.classList.add('btn-close')
    //adiciona o atributo "role" com o valor "alert" no elemento div
    div.setAttribute('role', 'alert')
    //adiciona o atributo "type" com o valor "button" no elemento button
    button.setAttribute('type','button')
    button.setAttribute('aria-label','Close')

    //adiciona o EventListener no botão
    button.addEventListener('click', () => {
      //remove a div
      div.remove()
    })
    //adiciona o elemento botão como filho dessa div
    div.appendChild(button)
    //adiciona no DOM o elemento div logo após o fim do elemento currenciesEl
    currenciesEl.insertAdjacentElement('afterend', div)
    
/*
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Holy guacamole!</strong> You should check in on some of those fields below.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
*/
  }
}

const init = async () => {
  // executa a chamada da API e espalha (spread) o retorno no objeto internalExchangeRate
  internalExchangeRate = { ...(await fetchExchangeRate(getUrl('USD'))) }

  //método Object.keys é usado para acessar e trabalhar com as chaves de um objeto
  //a expressão está gerando um array de options e então fazendo a junção por espaço vazio
  const getOptions = selectedCurrency => Object.keys(internalExchangeRate.conversion_rates)
    .map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
    .join('')
    
  //alterando o objeto do DOM
  currencyOneEl.innerHTML = getOptions('USD')
  currencyTwoEl.innerHTML = getOptions('BRL')
  
  convertedValueEl.textContent = internalExchangeRate.conversion_rates.BRL.toFixed(2)
  valuePrecisionEl.textContent = `1 USD = ${internalExchangeRate.conversion_rates.BRL} BRL`
}

timeCurrencyOneEl.addEventListener('input', e => {
  // e.target.value retorna o valor do elemento alvo do evento
  convertedValueEl.textContent = 
    (e.target.value * internalExchangeRate.conversion_rates[currencyTwoEl.value])
      .toFixed(2)
})

currencyTwoEl.addEventListener('input', e => {
  const currencyTwoValue = internalExchangeRate.conversion_rates[e.target.value]
  convertedValueEl.textContent = (timeCurrencyOneEl.value * currencyTwoValue).toFixed(2)
  valuePrecisionEl.textContent = 
    `1 ${currencyOneEl.value} = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} 
       ${currencyTwoEl.value}`
})

currencyOneEl.addEventListener('input', async e => {
  //executa a chamada da API e espalha (spread) o retorno no objeto internalExchangeRate
  internalExchangeRate = { ...(await fetchExchangeRate(getUrl(e.target.value))) }
  
  convertedValueEl.textContent = 
    (timeCurrencyOneEl.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
  
  valuePrecisionEl.textContent =  
    `1 ${currencyOneEl.value} = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} 
       ${currencyTwoEl.value}`
})

init()
