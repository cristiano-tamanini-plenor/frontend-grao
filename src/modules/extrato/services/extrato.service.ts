// Tipos para os dados do extrato
export interface ExtratoItem {
  type: number;
  typecolumn: string;
  source: string;
  guid: string;
  origin: string;
  value: number;
  status: string;
  account: {
    id: number;
    name: string;
    bank_code: string;
  };
  installment?: {
    id: number;
    guid: string;
    installment: number;
    original_value: string;
    additional_value: string;
    discount_value: string;
    movement_value: string;
    balance_value: string;
    comment: string | null;
    expiration_date: string;
    payment_date: string;
    document: {
      id: number;
      guid: string;
      code: string;
      generation_date: string;
      code_reference: string | null;
      purchase_order: string | null;
      comment: string | null;
      description: string;
      payment_method_type: string;
      original_value: string;
      additional_value: string;
      discount_value: string;
      value: string;
      people: {
        id: number;
        guid: string;
        entity_type: string;
        cnpjcpf: string;
        name: string;
        fantasy_name: string;
        cep: string;
        number: number;
      };
      cost_centers: Array<{
        id: number;
        name: string;
        percentage: string;
        value: string;
      }>;
      category_level_3: {
        id: number;
        structure: string;
        description: string;
      };
      category_level_2: {
        id: number;
        structure: string;
        description: string;
      };
      category_level_1: {
        id: number;
        structure: string;
        description: string;
      };
    };
  };
  transfers?: {
    id: number;
    guid: string;
    original_account: {
      id: number;
      name: string;
    };
    destination_account: {
      id: number;
      name: string;
    };
    value: string;
    description: string;
  };
  treasury: {
    id: number;
    guid: string;
    value: string;
    additional_value: string;
    discount_value: string;
    movement_value: string;
    movement_date: string;
    comment: string;
  };
}

export interface ExtratoResponse {
  data: ExtratoItem[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    first_page: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string;
    previous_page_url: string | null;
    metrics: {
      total_receitas: number;
      total_despesas: number;
      saldo_final: number;
      total_receitas_previsto: number;
      total_despesas_previsto: number;
      total_receitas_realizado: number;
      total_despesas_realizado: number;
    };
  };
}

export interface ExtratoRequest {
  client_id: string;
  client_secret: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

class ExtratoService {
  constructor() {
    // Serviço simplificado para dados mock
  }

  async getExtrato(request: ExtratoRequest): Promise<ExtratoResponse> {
    // Sempre retornar dados mock por enquanto
    return this.getExtratoMock(request);
  }

  // Método para simular dados quando a API não estiver disponível
  async getExtratoMock(request: ExtratoRequest): Promise<ExtratoResponse> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dados mockados baseados no arquivo JSON fornecido
    const mockData: ExtratoItem[] = [
      {
        type: -1,
        typecolumn: "realizado",
        source: "bills_to_pay",
        guid: "22fd9438-83a3-43cd-9752-4059befcf70e",
        origin: "Contas a Pagar",
        value: 260,
        status: "Conciliado",
        account: {
          id: 4065,
          name: "Asaas",
          bank_code: "461"
        },
        installment: {
          id: 35420583,
          guid: "8e798f5d-2380-45b5-abe4-552fa28759f5",
          installment: 4,
          original_value: "260.00",
          additional_value: "0.00",
          discount_value: "0.00",
          movement_value: "260.00",
          balance_value: "0.00",
          comment: null,
          expiration_date: "2025-09-30T12:00:00.000-03:00",
          payment_date: "2025-09-30T09:56:58.888-03:00",
          document: {
            id: 35561465,
            guid: "1c0bab0a-f59e-4ceb-9d49-d7b7e7c766fc",
            code: "41851/4",
            generation_date: "2025-09-30T12:00:00.000-03:00",
            code_reference: null,
            purchase_order: null,
            comment: null,
            description: "Royalties - AUMAXIMA ASSESSORIA EM MARKETING",
            payment_method_type: "debito em conta",
            original_value: "260.00",
            additional_value: "0.00",
            discount_value: "0.00",
            value: "260.00",
            people: {
              id: 178299,
              guid: "305c4971-22bf-49f8-a47f-8ba50e550a77",
              entity_type: "PJ",
              cnpjcpf: "36.448.480/0001-03",
              name: "MARVEE SERVICOS FINANCEIROS LTDA",
              fantasy_name: "MARVEE FINANCEIRO POR ASSINATURA",
              cep: "89030-000",
              number: 3366
            },
            cost_centers: [
              {
                id: 1525677,
                name: "01.02 - Deize Colaço",
                percentage: "1.000000",
                value: "260.00"
              }
            ],
            category_level_3: {
              id: 215865,
              structure: "02.02.10",
              description: "Royalties"
            },
            category_level_2: {
              id: 107274,
              structure: "02.02",
              description: "Despesas com Prestação de Serviço"
            },
            category_level_1: {
              id: 107264,
              structure: "02",
              description: "Despesas Operacionais"
            }
          }
        },
        treasury: {
          id: 29528086,
          guid: "22fd9438-83a3-43cd-9752-4059befcf70e",
          value: "260.000000",
          additional_value: "0.00",
          discount_value: "0.00",
          movement_value: "260.000000",
          movement_date: "2025-10-01T00:00:00.000-03:00",
          comment: ""
        }
      },
      {
        type: 1,
        typecolumn: "realizado",
        source: "bills_to_receive",
        guid: "ca843d1e-74ee-4eb2-8bc7-3a4383c60fa6",
        origin: "Contas a Receber",
        value: 1040,
        status: "Conciliado",
        account: {
          id: 4065,
          name: "Asaas",
          bank_code: "461"
        },
        installment: {
          id: 35420572,
          guid: "3ebfc16a-ab36-4106-af7e-967fde65a947",
          installment: 4,
          original_value: "1040.00",
          additional_value: "0.00",
          discount_value: "0.00",
          movement_value: "1040.00",
          balance_value: "0.00",
          comment: null,
          expiration_date: "2025-09-30T12:00:00.000-03:00",
          payment_date: "2025-09-30T09:56:58.888-03:00",
          document: {
            id: 35561454,
            guid: "249be0b6-2754-4181-b9ab-1334319d626b",
            code: "41851/4",
            generation_date: "2025-09-30T12:00:00.000-03:00",
            code_reference: null,
            purchase_order: null,
            comment: null,
            description: "Prestação de Serviço de Apoio Financeiro - AUMAXIMA ASSESSORIA EM MARKETING",
            payment_method_type: "boleto",
            original_value: "1040.00",
            additional_value: "0.00",
            discount_value: "0.00",
            value: "1040.00",
            people: {
              id: 368263,
              guid: "7fafcee0-5a22-4151-b9ef-92bce0a1e57a",
              entity_type: "PJ",
              cnpjcpf: "43.632.423/0001-37",
              name: "AUMAXIMA ASSESSORIA EM MARKETING LTDA",
              fantasy_name: "AUMAXIMA ASSESSORIA EM MARKETING",
              cep: "83414-220",
              number: 365
            },
            cost_centers: [
              {
                id: 1525666,
                name: "01.02 - Deize Colaço",
                percentage: "1.000000",
                value: "1040.00"
              }
            ],
            category_level_3: {
              id: 107258,
              structure: "01.01.01",
              description: "Receitas Recorrentes (fee mensal)"
            },
            category_level_2: {
              id: 107257,
              structure: "01.01",
              description: "Receitas de Serviço"
            },
            category_level_1: {
              id: 107256,
              structure: "01",
              description: "Receitas Operacionais"
            }
          }
        },
        treasury: {
          id: 29528085,
          guid: "ca843d1e-74ee-4eb2-8bc7-3a4383c60fa6",
          value: "1040.000000",
          additional_value: "0.00",
          discount_value: "0.00",
          movement_value: "1040.000000",
          movement_date: "2025-10-02T00:00:00.000-03:00",
          comment: ""
        }
      },
      {
        type: -1,
        typecolumn: "realizado",
        source: "transfer_out",
        guid: "a7bc28b7-5f06-429a-a8dc-308012e3a22c",
        origin: "Outros",
        value: 780,
        status: "Conciliado",
        account: {
          id: 4065,
          name: "Asaas",
          bank_code: "461"
        },
        transfers: {
          id: 694995,
          guid: "8b9cf283-79d3-40f3-b5db-1d8149d82fe4",
          original_account: {
            id: 4065,
            name: "Asaas"
          },
          destination_account: {
            id: 4066,
            name: "Banco Inter"
          },
          value: "780.000000",
          description: "Transferência Automática  evt_a6f35f7766677518090c06e66ea44a4e&1075866573"
        },
        treasury: {
          id: 29528446,
          guid: "a7bc28b7-5f06-429a-a8dc-308012e3a22c",
          value: "780.000000",
          additional_value: "0.00",
          discount_value: "0.00",
          movement_value: "780.000000",
          movement_date: "2025-10-03T00:00:00.000-03:00",
          comment: "Transferência entre Contas"
        }
      },
      {
        type: -1,
        typecolumn: "realizado",
        source: "bills_to_pay",
        guid: "bf95556c-0e52-4978-9bc7-b7bb1d04ed7e",
        origin: "Contas a Pagar",
        value: 180,
        status: "Conciliado",
        account: {
          id: 4066,
          name: "Banco Inter",
          bank_code: "077"
        },
        installment: {
          id: 36099764,
          guid: "0623057c-319a-4c66-80dc-37fddaab144c",
          installment: 1,
          original_value: "180.00",
          additional_value: "0.00",
          discount_value: "0.00",
          movement_value: "180.00",
          balance_value: "0.00",
          comment: null,
          expiration_date: "2025-09-30T12:00:00.000-03:00",
          payment_date: "2025-09-30T12:00:00.000-03:00",
          document: {
            id: 36223889,
            guid: "6625f60c-01cd-44ac-9d46-2bc8d7cf0156",
            code: "1759322094",
            generation_date: "2025-09-30T12:00:00.000-03:00",
            code_reference: "",
            purchase_order: "",
            comment: null,
            description: "Cristiano Tamanini",
            payment_method_type: "pix",
            original_value: "180.00",
            additional_value: "0.00",
            discount_value: "0.00",
            value: "180.00",
            people: {
              id: 178292,
              guid: "1166d56f-6d14-4cf0-9321-7d254a32c4f9",
              entity_type: "PF",
              cnpjcpf: "086.164.739-47",
              name: "CRISTIANO TAMANINI",
              fantasy_name: "CRISTIANO TAMANINI",
              cep: "89032-520",
              number: 85
            },
            cost_centers: [],
            category_level_3: {
              id: 107381,
              structure: "05.01.03",
              description: "Distribuição de Lucros / Dividendos"
            },
            category_level_2: {
              id: 107378,
              structure: "05.01",
              description: "Distribuição de Lucros"
            },
            category_level_1: {
              id: 107377,
              structure: "05",
              description: "Distribuição de Lucros"
            }
          }
        },
        treasury: {
          id: 29532920,
          guid: "bf95556c-0e52-4978-9bc7-b7bb1d04ed7e",
          value: "180.000000",
          additional_value: "0.00",
          discount_value: "0.00",
          movement_value: "180.000000",
          movement_date: "2025-10-04T00:00:00.000-03:00",
          comment: ""
        }
      },
      {
        type: 1,
        typecolumn: "realizado",
        source: "transfer_in",
        guid: "2a3c7381-8184-4c83-8f28-3be6a776aed9",
        origin: "Outros",
        value: 780,
        status: "Conciliado",
        account: {
          id: 4066,
          name: "Banco Inter",
          bank_code: "077"
        },
        transfers: {
          id: 694995,
          guid: "8b9cf283-79d3-40f3-b5db-1d8149d82fe4",
          original_account: {
            id: 4065,
            name: "Asaas"
          },
          destination_account: {
            id: 4066,
            name: "Banco Inter"
          },
          value: "780.000000",
          description: "Transferência Automática  evt_a6f35f7766677518090c06e66ea44a4e&1075866573"
        },
        treasury: {
          id: 29528444,
          guid: "2a3c7381-8184-4c83-8f28-3be6a776aed9",
          value: "780.000000",
          additional_value: "0.00",
          discount_value: "0.00",
          movement_value: "780.000000",
          movement_date: "2025-10-05T00:00:00.000-03:00",
          comment: "Transferência entre Contas"
        }
      }
    ];

    return {
      data: mockData,
      meta: {
        total: 166,
        per_page: 20,
        current_page: 1,
        last_page: 9,
        first_page: 1,
        first_page_url: "",
        last_page_url: "",
        next_page_url: "",
        previous_page_url: null,
        metrics: {
          total_receitas: 68429.05,
          total_despesas: 57781.5,
          saldo_final: 10647.550000000005,
          total_receitas_previsto: 30537.07,
          total_despesas_previsto: 8709.74,
          total_receitas_realizado: 37891.98,
          total_despesas_realizado: 49071.76
        }
      }
    };
  }
}

export const extratoService = new ExtratoService();
