declare global {
	interface Window {
		IMP: {
			init: (merchantId: string) => void;
			request_pay: (
				params: {
					pg?: string;
					pay_method: string;
					merchant_uid: string;
					name: string;
					amount: number;
					buyer_name?: string;
					buyer_tel?: string;
					buyer_email?: string;
					buyer_addr?: string;
					buyer_postcode?: string;
				},
				callback: (response: {
					success: boolean;
					imp_uid?: string;
					merchant_uid: string;
					error_msg?: string;
				}) => void,
			) => void;
		};
	}
}

export {};
