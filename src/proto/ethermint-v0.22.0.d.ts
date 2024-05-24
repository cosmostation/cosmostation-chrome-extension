import * as $protobuf from "protobufjs";
/** Namespace ethermint. */
export namespace ethermint {

    /** Namespace crypto. */
    namespace crypto {

        /** Namespace v1. */
        namespace v1 {

            /** Namespace ethsecp256k1. */
            namespace ethsecp256k1 {

                /** Properties of a PubKey. */
                interface IPubKey {

                    /** PubKey key */
                    key?: (Uint8Array|null);
                }

                /** Represents a PubKey. */
                class PubKey implements IPubKey {

                    /**
                     * Constructs a new PubKey.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: ethermint.crypto.v1.ethsecp256k1.IPubKey);

                    /** PubKey key. */
                    public key: Uint8Array;

                    /**
                     * Encodes the specified PubKey message. Does not implicitly {@link ethermint.crypto.v1.ethsecp256k1.PubKey.verify|verify} messages.
                     * @param message PubKey message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: ethermint.crypto.v1.ethsecp256k1.IPubKey, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified PubKey message, length delimited. Does not implicitly {@link ethermint.crypto.v1.ethsecp256k1.PubKey.verify|verify} messages.
                     * @param message PubKey message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: ethermint.crypto.v1.ethsecp256k1.IPubKey, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a PubKey message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns PubKey
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.crypto.v1.ethsecp256k1.PubKey;

                    /**
                     * Decodes a PubKey message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns PubKey
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.crypto.v1.ethsecp256k1.PubKey;

                    /**
                     * Verifies a PubKey message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a PubKey message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns PubKey
                     */
                    public static fromObject(object: { [k: string]: any }): ethermint.crypto.v1.ethsecp256k1.PubKey;

                    /**
                     * Creates a plain object from a PubKey message. Also converts values to other types if specified.
                     * @param message PubKey
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: ethermint.crypto.v1.ethsecp256k1.PubKey, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this PubKey to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a PrivKey. */
                interface IPrivKey {

                    /** PrivKey key */
                    key?: (Uint8Array|null);
                }

                /** Represents a PrivKey. */
                class PrivKey implements IPrivKey {

                    /**
                     * Constructs a new PrivKey.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: ethermint.crypto.v1.ethsecp256k1.IPrivKey);

                    /** PrivKey key. */
                    public key: Uint8Array;

                    /**
                     * Encodes the specified PrivKey message. Does not implicitly {@link ethermint.crypto.v1.ethsecp256k1.PrivKey.verify|verify} messages.
                     * @param message PrivKey message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: ethermint.crypto.v1.ethsecp256k1.IPrivKey, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified PrivKey message, length delimited. Does not implicitly {@link ethermint.crypto.v1.ethsecp256k1.PrivKey.verify|verify} messages.
                     * @param message PrivKey message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: ethermint.crypto.v1.ethsecp256k1.IPrivKey, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a PrivKey message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns PrivKey
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.crypto.v1.ethsecp256k1.PrivKey;

                    /**
                     * Decodes a PrivKey message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns PrivKey
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.crypto.v1.ethsecp256k1.PrivKey;

                    /**
                     * Verifies a PrivKey message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a PrivKey message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns PrivKey
                     */
                    public static fromObject(object: { [k: string]: any }): ethermint.crypto.v1.ethsecp256k1.PrivKey;

                    /**
                     * Creates a plain object from a PrivKey message. Also converts values to other types if specified.
                     * @param message PrivKey
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: ethermint.crypto.v1.ethsecp256k1.PrivKey, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this PrivKey to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }
        }
    }

    /** Namespace evm. */
    namespace evm {

        /** Namespace v1. */
        namespace v1 {

            /** Represents a Msg */
            class Msg extends $protobuf.rpc.Service {

                /**
                 * Constructs a new Msg service.
                 * @param rpcImpl RPC implementation
                 * @param [requestDelimited=false] Whether requests are length-delimited
                 * @param [responseDelimited=false] Whether responses are length-delimited
                 */
                constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                /**
                 * Calls EthereumTx.
                 * @param request MsgEthereumTx message or plain object
                 * @param callback Node-style callback called with the error, if any, and MsgEthereumTxResponse
                 */
                public ethereumTx(request: ethermint.evm.v1.IMsgEthereumTx, callback: ethermint.evm.v1.Msg.EthereumTxCallback): void;

                /**
                 * Calls EthereumTx.
                 * @param request MsgEthereumTx message or plain object
                 * @returns Promise
                 */
                public ethereumTx(request: ethermint.evm.v1.IMsgEthereumTx): Promise<ethermint.evm.v1.MsgEthereumTxResponse>;

                /**
                 * Calls UpdateParams.
                 * @param request MsgUpdateParams message or plain object
                 * @param callback Node-style callback called with the error, if any, and MsgUpdateParamsResponse
                 */
                public updateParams(request: ethermint.evm.v1.IMsgUpdateParams, callback: ethermint.evm.v1.Msg.UpdateParamsCallback): void;

                /**
                 * Calls UpdateParams.
                 * @param request MsgUpdateParams message or plain object
                 * @returns Promise
                 */
                public updateParams(request: ethermint.evm.v1.IMsgUpdateParams): Promise<ethermint.evm.v1.MsgUpdateParamsResponse>;
            }

            namespace Msg {

                /**
                 * Callback as used by {@link ethermint.evm.v1.Msg#ethereumTx}.
                 * @param error Error, if any
                 * @param [response] MsgEthereumTxResponse
                 */
                type EthereumTxCallback = (error: (Error|null), response?: ethermint.evm.v1.MsgEthereumTxResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Msg#updateParams}.
                 * @param error Error, if any
                 * @param [response] MsgUpdateParamsResponse
                 */
                type UpdateParamsCallback = (error: (Error|null), response?: ethermint.evm.v1.MsgUpdateParamsResponse) => void;
            }

            /** Properties of a MsgEthereumTx. */
            interface IMsgEthereumTx {

                /** MsgEthereumTx data */
                data?: (google.protobuf.IAny|null);

                /** MsgEthereumTx size */
                size?: (number|null);

                /** MsgEthereumTx hash */
                hash?: (string|null);

                /** MsgEthereumTx from */
                from?: (string|null);
            }

            /** Represents a MsgEthereumTx. */
            class MsgEthereumTx implements IMsgEthereumTx {

                /**
                 * Constructs a new MsgEthereumTx.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IMsgEthereumTx);

                /** MsgEthereumTx data. */
                public data?: (google.protobuf.IAny|null);

                /** MsgEthereumTx size. */
                public size: number;

                /** MsgEthereumTx hash. */
                public hash: string;

                /** MsgEthereumTx from. */
                public from: string;

                /**
                 * Encodes the specified MsgEthereumTx message. Does not implicitly {@link ethermint.evm.v1.MsgEthereumTx.verify|verify} messages.
                 * @param message MsgEthereumTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IMsgEthereumTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MsgEthereumTx message, length delimited. Does not implicitly {@link ethermint.evm.v1.MsgEthereumTx.verify|verify} messages.
                 * @param message MsgEthereumTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IMsgEthereumTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MsgEthereumTx message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MsgEthereumTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.MsgEthereumTx;

                /**
                 * Decodes a MsgEthereumTx message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MsgEthereumTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.MsgEthereumTx;

                /**
                 * Verifies a MsgEthereumTx message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MsgEthereumTx message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MsgEthereumTx
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.MsgEthereumTx;

                /**
                 * Creates a plain object from a MsgEthereumTx message. Also converts values to other types if specified.
                 * @param message MsgEthereumTx
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.MsgEthereumTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MsgEthereumTx to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a LegacyTx. */
            interface ILegacyTx {

                /** LegacyTx nonce */
                nonce?: (number|null);

                /** LegacyTx gas_price */
                gas_price?: (string|null);

                /** LegacyTx gas */
                gas?: (number|null);

                /** LegacyTx to */
                to?: (string|null);

                /** LegacyTx value */
                value?: (string|null);

                /** LegacyTx data */
                data?: (Uint8Array|null);

                /** LegacyTx v */
                v?: (Uint8Array|null);

                /** LegacyTx r */
                r?: (Uint8Array|null);

                /** LegacyTx s */
                s?: (Uint8Array|null);
            }

            /** Represents a LegacyTx. */
            class LegacyTx implements ILegacyTx {

                /**
                 * Constructs a new LegacyTx.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.ILegacyTx);

                /** LegacyTx nonce. */
                public nonce: number;

                /** LegacyTx gas_price. */
                public gas_price: string;

                /** LegacyTx gas. */
                public gas: number;

                /** LegacyTx to. */
                public to: string;

                /** LegacyTx value. */
                public value: string;

                /** LegacyTx data. */
                public data: Uint8Array;

                /** LegacyTx v. */
                public v: Uint8Array;

                /** LegacyTx r. */
                public r: Uint8Array;

                /** LegacyTx s. */
                public s: Uint8Array;

                /**
                 * Encodes the specified LegacyTx message. Does not implicitly {@link ethermint.evm.v1.LegacyTx.verify|verify} messages.
                 * @param message LegacyTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.ILegacyTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified LegacyTx message, length delimited. Does not implicitly {@link ethermint.evm.v1.LegacyTx.verify|verify} messages.
                 * @param message LegacyTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.ILegacyTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a LegacyTx message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns LegacyTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.LegacyTx;

                /**
                 * Decodes a LegacyTx message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns LegacyTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.LegacyTx;

                /**
                 * Verifies a LegacyTx message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a LegacyTx message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns LegacyTx
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.LegacyTx;

                /**
                 * Creates a plain object from a LegacyTx message. Also converts values to other types if specified.
                 * @param message LegacyTx
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.LegacyTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this LegacyTx to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an AccessListTx. */
            interface IAccessListTx {

                /** AccessListTx chain_id */
                chain_id?: (string|null);

                /** AccessListTx nonce */
                nonce?: (number|null);

                /** AccessListTx gas_price */
                gas_price?: (string|null);

                /** AccessListTx gas */
                gas?: (number|null);

                /** AccessListTx to */
                to?: (string|null);

                /** AccessListTx value */
                value?: (string|null);

                /** AccessListTx data */
                data?: (Uint8Array|null);

                /** AccessListTx accesses */
                accesses?: (ethermint.evm.v1.IAccessTuple[]|null);

                /** AccessListTx v */
                v?: (Uint8Array|null);

                /** AccessListTx r */
                r?: (Uint8Array|null);

                /** AccessListTx s */
                s?: (Uint8Array|null);
            }

            /** Represents an AccessListTx. */
            class AccessListTx implements IAccessListTx {

                /**
                 * Constructs a new AccessListTx.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IAccessListTx);

                /** AccessListTx chain_id. */
                public chain_id: string;

                /** AccessListTx nonce. */
                public nonce: number;

                /** AccessListTx gas_price. */
                public gas_price: string;

                /** AccessListTx gas. */
                public gas: number;

                /** AccessListTx to. */
                public to: string;

                /** AccessListTx value. */
                public value: string;

                /** AccessListTx data. */
                public data: Uint8Array;

                /** AccessListTx accesses. */
                public accesses: ethermint.evm.v1.IAccessTuple[];

                /** AccessListTx v. */
                public v: Uint8Array;

                /** AccessListTx r. */
                public r: Uint8Array;

                /** AccessListTx s. */
                public s: Uint8Array;

                /**
                 * Encodes the specified AccessListTx message. Does not implicitly {@link ethermint.evm.v1.AccessListTx.verify|verify} messages.
                 * @param message AccessListTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IAccessListTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified AccessListTx message, length delimited. Does not implicitly {@link ethermint.evm.v1.AccessListTx.verify|verify} messages.
                 * @param message AccessListTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IAccessListTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an AccessListTx message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns AccessListTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.AccessListTx;

                /**
                 * Decodes an AccessListTx message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns AccessListTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.AccessListTx;

                /**
                 * Verifies an AccessListTx message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an AccessListTx message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns AccessListTx
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.AccessListTx;

                /**
                 * Creates a plain object from an AccessListTx message. Also converts values to other types if specified.
                 * @param message AccessListTx
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.AccessListTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this AccessListTx to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a DynamicFeeTx. */
            interface IDynamicFeeTx {

                /** DynamicFeeTx chain_id */
                chain_id?: (string|null);

                /** DynamicFeeTx nonce */
                nonce?: (number|null);

                /** DynamicFeeTx gas_tip_cap */
                gas_tip_cap?: (string|null);

                /** DynamicFeeTx gas_fee_cap */
                gas_fee_cap?: (string|null);

                /** DynamicFeeTx gas */
                gas?: (number|null);

                /** DynamicFeeTx to */
                to?: (string|null);

                /** DynamicFeeTx value */
                value?: (string|null);

                /** DynamicFeeTx data */
                data?: (Uint8Array|null);

                /** DynamicFeeTx accesses */
                accesses?: (ethermint.evm.v1.IAccessTuple[]|null);

                /** DynamicFeeTx v */
                v?: (Uint8Array|null);

                /** DynamicFeeTx r */
                r?: (Uint8Array|null);

                /** DynamicFeeTx s */
                s?: (Uint8Array|null);
            }

            /** Represents a DynamicFeeTx. */
            class DynamicFeeTx implements IDynamicFeeTx {

                /**
                 * Constructs a new DynamicFeeTx.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IDynamicFeeTx);

                /** DynamicFeeTx chain_id. */
                public chain_id: string;

                /** DynamicFeeTx nonce. */
                public nonce: number;

                /** DynamicFeeTx gas_tip_cap. */
                public gas_tip_cap: string;

                /** DynamicFeeTx gas_fee_cap. */
                public gas_fee_cap: string;

                /** DynamicFeeTx gas. */
                public gas: number;

                /** DynamicFeeTx to. */
                public to: string;

                /** DynamicFeeTx value. */
                public value: string;

                /** DynamicFeeTx data. */
                public data: Uint8Array;

                /** DynamicFeeTx accesses. */
                public accesses: ethermint.evm.v1.IAccessTuple[];

                /** DynamicFeeTx v. */
                public v: Uint8Array;

                /** DynamicFeeTx r. */
                public r: Uint8Array;

                /** DynamicFeeTx s. */
                public s: Uint8Array;

                /**
                 * Encodes the specified DynamicFeeTx message. Does not implicitly {@link ethermint.evm.v1.DynamicFeeTx.verify|verify} messages.
                 * @param message DynamicFeeTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IDynamicFeeTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified DynamicFeeTx message, length delimited. Does not implicitly {@link ethermint.evm.v1.DynamicFeeTx.verify|verify} messages.
                 * @param message DynamicFeeTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IDynamicFeeTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a DynamicFeeTx message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns DynamicFeeTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.DynamicFeeTx;

                /**
                 * Decodes a DynamicFeeTx message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns DynamicFeeTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.DynamicFeeTx;

                /**
                 * Verifies a DynamicFeeTx message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a DynamicFeeTx message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns DynamicFeeTx
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.DynamicFeeTx;

                /**
                 * Creates a plain object from a DynamicFeeTx message. Also converts values to other types if specified.
                 * @param message DynamicFeeTx
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.DynamicFeeTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this DynamicFeeTx to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an ExtensionOptionsEthereumTx. */
            interface IExtensionOptionsEthereumTx {
            }

            /** Represents an ExtensionOptionsEthereumTx. */
            class ExtensionOptionsEthereumTx implements IExtensionOptionsEthereumTx {

                /**
                 * Constructs a new ExtensionOptionsEthereumTx.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IExtensionOptionsEthereumTx);

                /**
                 * Encodes the specified ExtensionOptionsEthereumTx message. Does not implicitly {@link ethermint.evm.v1.ExtensionOptionsEthereumTx.verify|verify} messages.
                 * @param message ExtensionOptionsEthereumTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IExtensionOptionsEthereumTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ExtensionOptionsEthereumTx message, length delimited. Does not implicitly {@link ethermint.evm.v1.ExtensionOptionsEthereumTx.verify|verify} messages.
                 * @param message ExtensionOptionsEthereumTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IExtensionOptionsEthereumTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ExtensionOptionsEthereumTx message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ExtensionOptionsEthereumTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.ExtensionOptionsEthereumTx;

                /**
                 * Decodes an ExtensionOptionsEthereumTx message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ExtensionOptionsEthereumTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.ExtensionOptionsEthereumTx;

                /**
                 * Verifies an ExtensionOptionsEthereumTx message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ExtensionOptionsEthereumTx message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ExtensionOptionsEthereumTx
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.ExtensionOptionsEthereumTx;

                /**
                 * Creates a plain object from an ExtensionOptionsEthereumTx message. Also converts values to other types if specified.
                 * @param message ExtensionOptionsEthereumTx
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.ExtensionOptionsEthereumTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ExtensionOptionsEthereumTx to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a MsgEthereumTxResponse. */
            interface IMsgEthereumTxResponse {

                /** MsgEthereumTxResponse hash */
                hash?: (string|null);

                /** MsgEthereumTxResponse logs */
                logs?: (ethermint.evm.v1.ILog[]|null);

                /** MsgEthereumTxResponse ret */
                ret?: (Uint8Array|null);

                /** MsgEthereumTxResponse vm_error */
                vm_error?: (string|null);

                /** MsgEthereumTxResponse gas_used */
                gas_used?: (number|null);
            }

            /** Represents a MsgEthereumTxResponse. */
            class MsgEthereumTxResponse implements IMsgEthereumTxResponse {

                /**
                 * Constructs a new MsgEthereumTxResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IMsgEthereumTxResponse);

                /** MsgEthereumTxResponse hash. */
                public hash: string;

                /** MsgEthereumTxResponse logs. */
                public logs: ethermint.evm.v1.ILog[];

                /** MsgEthereumTxResponse ret. */
                public ret: Uint8Array;

                /** MsgEthereumTxResponse vm_error. */
                public vm_error: string;

                /** MsgEthereumTxResponse gas_used. */
                public gas_used: number;

                /**
                 * Encodes the specified MsgEthereumTxResponse message. Does not implicitly {@link ethermint.evm.v1.MsgEthereumTxResponse.verify|verify} messages.
                 * @param message MsgEthereumTxResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IMsgEthereumTxResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MsgEthereumTxResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.MsgEthereumTxResponse.verify|verify} messages.
                 * @param message MsgEthereumTxResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IMsgEthereumTxResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MsgEthereumTxResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MsgEthereumTxResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.MsgEthereumTxResponse;

                /**
                 * Decodes a MsgEthereumTxResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MsgEthereumTxResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.MsgEthereumTxResponse;

                /**
                 * Verifies a MsgEthereumTxResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MsgEthereumTxResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MsgEthereumTxResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.MsgEthereumTxResponse;

                /**
                 * Creates a plain object from a MsgEthereumTxResponse message. Also converts values to other types if specified.
                 * @param message MsgEthereumTxResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.MsgEthereumTxResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MsgEthereumTxResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a MsgUpdateParams. */
            interface IMsgUpdateParams {

                /** MsgUpdateParams authority */
                authority?: (string|null);

                /** MsgUpdateParams params */
                params?: (ethermint.evm.v1.IParams|null);
            }

            /** Represents a MsgUpdateParams. */
            class MsgUpdateParams implements IMsgUpdateParams {

                /**
                 * Constructs a new MsgUpdateParams.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IMsgUpdateParams);

                /** MsgUpdateParams authority. */
                public authority: string;

                /** MsgUpdateParams params. */
                public params?: (ethermint.evm.v1.IParams|null);

                /**
                 * Encodes the specified MsgUpdateParams message. Does not implicitly {@link ethermint.evm.v1.MsgUpdateParams.verify|verify} messages.
                 * @param message MsgUpdateParams message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IMsgUpdateParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MsgUpdateParams message, length delimited. Does not implicitly {@link ethermint.evm.v1.MsgUpdateParams.verify|verify} messages.
                 * @param message MsgUpdateParams message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IMsgUpdateParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MsgUpdateParams message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MsgUpdateParams
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.MsgUpdateParams;

                /**
                 * Decodes a MsgUpdateParams message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MsgUpdateParams
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.MsgUpdateParams;

                /**
                 * Verifies a MsgUpdateParams message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MsgUpdateParams message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MsgUpdateParams
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.MsgUpdateParams;

                /**
                 * Creates a plain object from a MsgUpdateParams message. Also converts values to other types if specified.
                 * @param message MsgUpdateParams
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.MsgUpdateParams, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MsgUpdateParams to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a MsgUpdateParamsResponse. */
            interface IMsgUpdateParamsResponse {
            }

            /** Represents a MsgUpdateParamsResponse. */
            class MsgUpdateParamsResponse implements IMsgUpdateParamsResponse {

                /**
                 * Constructs a new MsgUpdateParamsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IMsgUpdateParamsResponse);

                /**
                 * Encodes the specified MsgUpdateParamsResponse message. Does not implicitly {@link ethermint.evm.v1.MsgUpdateParamsResponse.verify|verify} messages.
                 * @param message MsgUpdateParamsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IMsgUpdateParamsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MsgUpdateParamsResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.MsgUpdateParamsResponse.verify|verify} messages.
                 * @param message MsgUpdateParamsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IMsgUpdateParamsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MsgUpdateParamsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MsgUpdateParamsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.MsgUpdateParamsResponse;

                /**
                 * Decodes a MsgUpdateParamsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MsgUpdateParamsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.MsgUpdateParamsResponse;

                /**
                 * Verifies a MsgUpdateParamsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MsgUpdateParamsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MsgUpdateParamsResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.MsgUpdateParamsResponse;

                /**
                 * Creates a plain object from a MsgUpdateParamsResponse message. Also converts values to other types if specified.
                 * @param message MsgUpdateParamsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.MsgUpdateParamsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MsgUpdateParamsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a Params. */
            interface IParams {

                /** Params evm_denom */
                evm_denom?: (string|null);

                /** Params enable_create */
                enable_create?: (boolean|null);

                /** Params enable_call */
                enable_call?: (boolean|null);

                /** Params extra_eips */
                extra_eips?: (number[]|null);

                /** Params chain_config */
                chain_config?: (ethermint.evm.v1.IChainConfig|null);

                /** Params allow_unprotected_txs */
                allow_unprotected_txs?: (boolean|null);
            }

            /** Represents a Params. */
            class Params implements IParams {

                /**
                 * Constructs a new Params.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IParams);

                /** Params evm_denom. */
                public evm_denom: string;

                /** Params enable_create. */
                public enable_create: boolean;

                /** Params enable_call. */
                public enable_call: boolean;

                /** Params extra_eips. */
                public extra_eips: number[];

                /** Params chain_config. */
                public chain_config?: (ethermint.evm.v1.IChainConfig|null);

                /** Params allow_unprotected_txs. */
                public allow_unprotected_txs: boolean;

                /**
                 * Encodes the specified Params message. Does not implicitly {@link ethermint.evm.v1.Params.verify|verify} messages.
                 * @param message Params message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Params message, length delimited. Does not implicitly {@link ethermint.evm.v1.Params.verify|verify} messages.
                 * @param message Params message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Params message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Params
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.Params;

                /**
                 * Decodes a Params message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Params
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.Params;

                /**
                 * Verifies a Params message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Params message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Params
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.Params;

                /**
                 * Creates a plain object from a Params message. Also converts values to other types if specified.
                 * @param message Params
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.Params, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Params to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ChainConfig. */
            interface IChainConfig {

                /** ChainConfig homestead_block */
                homestead_block?: (string|null);

                /** ChainConfig dao_fork_block */
                dao_fork_block?: (string|null);

                /** ChainConfig dao_fork_support */
                dao_fork_support?: (boolean|null);

                /** ChainConfig eip150_block */
                eip150_block?: (string|null);

                /** ChainConfig eip150_hash */
                eip150_hash?: (string|null);

                /** ChainConfig eip155_block */
                eip155_block?: (string|null);

                /** ChainConfig eip158_block */
                eip158_block?: (string|null);

                /** ChainConfig byzantium_block */
                byzantium_block?: (string|null);

                /** ChainConfig constantinople_block */
                constantinople_block?: (string|null);

                /** ChainConfig petersburg_block */
                petersburg_block?: (string|null);

                /** ChainConfig istanbul_block */
                istanbul_block?: (string|null);

                /** ChainConfig muir_glacier_block */
                muir_glacier_block?: (string|null);

                /** ChainConfig berlin_block */
                berlin_block?: (string|null);

                /** ChainConfig london_block */
                london_block?: (string|null);

                /** ChainConfig arrow_glacier_block */
                arrow_glacier_block?: (string|null);

                /** ChainConfig gray_glacier_block */
                gray_glacier_block?: (string|null);

                /** ChainConfig merge_netsplit_block */
                merge_netsplit_block?: (string|null);

                /** ChainConfig shanghai_block */
                shanghai_block?: (string|null);

                /** ChainConfig cancun_block */
                cancun_block?: (string|null);
            }

            /** Represents a ChainConfig. */
            class ChainConfig implements IChainConfig {

                /**
                 * Constructs a new ChainConfig.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IChainConfig);

                /** ChainConfig homestead_block. */
                public homestead_block: string;

                /** ChainConfig dao_fork_block. */
                public dao_fork_block: string;

                /** ChainConfig dao_fork_support. */
                public dao_fork_support: boolean;

                /** ChainConfig eip150_block. */
                public eip150_block: string;

                /** ChainConfig eip150_hash. */
                public eip150_hash: string;

                /** ChainConfig eip155_block. */
                public eip155_block: string;

                /** ChainConfig eip158_block. */
                public eip158_block: string;

                /** ChainConfig byzantium_block. */
                public byzantium_block: string;

                /** ChainConfig constantinople_block. */
                public constantinople_block: string;

                /** ChainConfig petersburg_block. */
                public petersburg_block: string;

                /** ChainConfig istanbul_block. */
                public istanbul_block: string;

                /** ChainConfig muir_glacier_block. */
                public muir_glacier_block: string;

                /** ChainConfig berlin_block. */
                public berlin_block: string;

                /** ChainConfig london_block. */
                public london_block: string;

                /** ChainConfig arrow_glacier_block. */
                public arrow_glacier_block: string;

                /** ChainConfig gray_glacier_block. */
                public gray_glacier_block: string;

                /** ChainConfig merge_netsplit_block. */
                public merge_netsplit_block: string;

                /** ChainConfig shanghai_block. */
                public shanghai_block: string;

                /** ChainConfig cancun_block. */
                public cancun_block: string;

                /**
                 * Encodes the specified ChainConfig message. Does not implicitly {@link ethermint.evm.v1.ChainConfig.verify|verify} messages.
                 * @param message ChainConfig message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IChainConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ChainConfig message, length delimited. Does not implicitly {@link ethermint.evm.v1.ChainConfig.verify|verify} messages.
                 * @param message ChainConfig message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IChainConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ChainConfig message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ChainConfig
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.ChainConfig;

                /**
                 * Decodes a ChainConfig message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ChainConfig
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.ChainConfig;

                /**
                 * Verifies a ChainConfig message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ChainConfig message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ChainConfig
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.ChainConfig;

                /**
                 * Creates a plain object from a ChainConfig message. Also converts values to other types if specified.
                 * @param message ChainConfig
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.ChainConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ChainConfig to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a State. */
            interface IState {

                /** State key */
                key?: (string|null);

                /** State value */
                value?: (string|null);
            }

            /** Represents a State. */
            class State implements IState {

                /**
                 * Constructs a new State.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IState);

                /** State key. */
                public key: string;

                /** State value. */
                public value: string;

                /**
                 * Encodes the specified State message. Does not implicitly {@link ethermint.evm.v1.State.verify|verify} messages.
                 * @param message State message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IState, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified State message, length delimited. Does not implicitly {@link ethermint.evm.v1.State.verify|verify} messages.
                 * @param message State message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IState, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a State message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns State
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.State;

                /**
                 * Decodes a State message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns State
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.State;

                /**
                 * Verifies a State message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a State message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns State
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.State;

                /**
                 * Creates a plain object from a State message. Also converts values to other types if specified.
                 * @param message State
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.State, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this State to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a TransactionLogs. */
            interface ITransactionLogs {

                /** TransactionLogs hash */
                hash?: (string|null);

                /** TransactionLogs logs */
                logs?: (ethermint.evm.v1.ILog[]|null);
            }

            /** Represents a TransactionLogs. */
            class TransactionLogs implements ITransactionLogs {

                /**
                 * Constructs a new TransactionLogs.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.ITransactionLogs);

                /** TransactionLogs hash. */
                public hash: string;

                /** TransactionLogs logs. */
                public logs: ethermint.evm.v1.ILog[];

                /**
                 * Encodes the specified TransactionLogs message. Does not implicitly {@link ethermint.evm.v1.TransactionLogs.verify|verify} messages.
                 * @param message TransactionLogs message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.ITransactionLogs, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TransactionLogs message, length delimited. Does not implicitly {@link ethermint.evm.v1.TransactionLogs.verify|verify} messages.
                 * @param message TransactionLogs message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.ITransactionLogs, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TransactionLogs message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TransactionLogs
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.TransactionLogs;

                /**
                 * Decodes a TransactionLogs message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TransactionLogs
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.TransactionLogs;

                /**
                 * Verifies a TransactionLogs message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TransactionLogs message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TransactionLogs
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.TransactionLogs;

                /**
                 * Creates a plain object from a TransactionLogs message. Also converts values to other types if specified.
                 * @param message TransactionLogs
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.TransactionLogs, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TransactionLogs to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a Log. */
            interface ILog {

                /** Log address */
                address?: (string|null);

                /** Log topics */
                topics?: (string[]|null);

                /** Log data */
                data?: (Uint8Array|null);

                /** Log block_number */
                block_number?: (number|null);

                /** Log tx_hash */
                tx_hash?: (string|null);

                /** Log tx_index */
                tx_index?: (number|null);

                /** Log block_hash */
                block_hash?: (string|null);

                /** Log index */
                index?: (number|null);

                /** Log removed */
                removed?: (boolean|null);
            }

            /** Represents a Log. */
            class Log implements ILog {

                /**
                 * Constructs a new Log.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.ILog);

                /** Log address. */
                public address: string;

                /** Log topics. */
                public topics: string[];

                /** Log data. */
                public data: Uint8Array;

                /** Log block_number. */
                public block_number: number;

                /** Log tx_hash. */
                public tx_hash: string;

                /** Log tx_index. */
                public tx_index: number;

                /** Log block_hash. */
                public block_hash: string;

                /** Log index. */
                public index: number;

                /** Log removed. */
                public removed: boolean;

                /**
                 * Encodes the specified Log message. Does not implicitly {@link ethermint.evm.v1.Log.verify|verify} messages.
                 * @param message Log message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.ILog, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Log message, length delimited. Does not implicitly {@link ethermint.evm.v1.Log.verify|verify} messages.
                 * @param message Log message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.ILog, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Log message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Log
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.Log;

                /**
                 * Decodes a Log message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Log
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.Log;

                /**
                 * Verifies a Log message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Log message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Log
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.Log;

                /**
                 * Creates a plain object from a Log message. Also converts values to other types if specified.
                 * @param message Log
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.Log, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Log to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a TxResult. */
            interface ITxResult {

                /** TxResult contract_address */
                contract_address?: (string|null);

                /** TxResult bloom */
                bloom?: (Uint8Array|null);

                /** TxResult tx_logs */
                tx_logs?: (ethermint.evm.v1.ITransactionLogs|null);

                /** TxResult ret */
                ret?: (Uint8Array|null);

                /** TxResult reverted */
                reverted?: (boolean|null);

                /** TxResult gas_used */
                gas_used?: (number|null);
            }

            /** Represents a TxResult. */
            class TxResult implements ITxResult {

                /**
                 * Constructs a new TxResult.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.ITxResult);

                /** TxResult contract_address. */
                public contract_address: string;

                /** TxResult bloom. */
                public bloom: Uint8Array;

                /** TxResult tx_logs. */
                public tx_logs?: (ethermint.evm.v1.ITransactionLogs|null);

                /** TxResult ret. */
                public ret: Uint8Array;

                /** TxResult reverted. */
                public reverted: boolean;

                /** TxResult gas_used. */
                public gas_used: number;

                /**
                 * Encodes the specified TxResult message. Does not implicitly {@link ethermint.evm.v1.TxResult.verify|verify} messages.
                 * @param message TxResult message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.ITxResult, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TxResult message, length delimited. Does not implicitly {@link ethermint.evm.v1.TxResult.verify|verify} messages.
                 * @param message TxResult message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.ITxResult, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TxResult message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TxResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.TxResult;

                /**
                 * Decodes a TxResult message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TxResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.TxResult;

                /**
                 * Verifies a TxResult message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TxResult message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TxResult
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.TxResult;

                /**
                 * Creates a plain object from a TxResult message. Also converts values to other types if specified.
                 * @param message TxResult
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.TxResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TxResult to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an AccessTuple. */
            interface IAccessTuple {

                /** AccessTuple address */
                address?: (string|null);

                /** AccessTuple storage_keys */
                storage_keys?: (string[]|null);
            }

            /** Represents an AccessTuple. */
            class AccessTuple implements IAccessTuple {

                /**
                 * Constructs a new AccessTuple.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IAccessTuple);

                /** AccessTuple address. */
                public address: string;

                /** AccessTuple storage_keys. */
                public storage_keys: string[];

                /**
                 * Encodes the specified AccessTuple message. Does not implicitly {@link ethermint.evm.v1.AccessTuple.verify|verify} messages.
                 * @param message AccessTuple message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IAccessTuple, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified AccessTuple message, length delimited. Does not implicitly {@link ethermint.evm.v1.AccessTuple.verify|verify} messages.
                 * @param message AccessTuple message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IAccessTuple, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an AccessTuple message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns AccessTuple
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.AccessTuple;

                /**
                 * Decodes an AccessTuple message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns AccessTuple
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.AccessTuple;

                /**
                 * Verifies an AccessTuple message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an AccessTuple message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns AccessTuple
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.AccessTuple;

                /**
                 * Creates a plain object from an AccessTuple message. Also converts values to other types if specified.
                 * @param message AccessTuple
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.AccessTuple, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this AccessTuple to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a TraceConfig. */
            interface ITraceConfig {

                /** TraceConfig tracer */
                tracer?: (string|null);

                /** TraceConfig timeout */
                timeout?: (string|null);

                /** TraceConfig reexec */
                reexec?: (number|null);

                /** TraceConfig disable_stack */
                disable_stack?: (boolean|null);

                /** TraceConfig disable_storage */
                disable_storage?: (boolean|null);

                /** TraceConfig debug */
                debug?: (boolean|null);

                /** TraceConfig limit */
                limit?: (number|null);

                /** TraceConfig overrides */
                overrides?: (ethermint.evm.v1.IChainConfig|null);

                /** TraceConfig enable_memory */
                enable_memory?: (boolean|null);

                /** TraceConfig enable_return_data */
                enable_return_data?: (boolean|null);

                /** TraceConfig tracer_json_config */
                tracer_json_config?: (string|null);
            }

            /** Represents a TraceConfig. */
            class TraceConfig implements ITraceConfig {

                /**
                 * Constructs a new TraceConfig.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.ITraceConfig);

                /** TraceConfig tracer. */
                public tracer: string;

                /** TraceConfig timeout. */
                public timeout: string;

                /** TraceConfig reexec. */
                public reexec: number;

                /** TraceConfig disable_stack. */
                public disable_stack: boolean;

                /** TraceConfig disable_storage. */
                public disable_storage: boolean;

                /** TraceConfig debug. */
                public debug: boolean;

                /** TraceConfig limit. */
                public limit: number;

                /** TraceConfig overrides. */
                public overrides?: (ethermint.evm.v1.IChainConfig|null);

                /** TraceConfig enable_memory. */
                public enable_memory: boolean;

                /** TraceConfig enable_return_data. */
                public enable_return_data: boolean;

                /** TraceConfig tracer_json_config. */
                public tracer_json_config: string;

                /**
                 * Encodes the specified TraceConfig message. Does not implicitly {@link ethermint.evm.v1.TraceConfig.verify|verify} messages.
                 * @param message TraceConfig message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.ITraceConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TraceConfig message, length delimited. Does not implicitly {@link ethermint.evm.v1.TraceConfig.verify|verify} messages.
                 * @param message TraceConfig message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.ITraceConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TraceConfig message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TraceConfig
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.TraceConfig;

                /**
                 * Decodes a TraceConfig message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TraceConfig
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.TraceConfig;

                /**
                 * Verifies a TraceConfig message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TraceConfig message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TraceConfig
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.TraceConfig;

                /**
                 * Creates a plain object from a TraceConfig message. Also converts values to other types if specified.
                 * @param message TraceConfig
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.TraceConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TraceConfig to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EventEthereumTx. */
            interface IEventEthereumTx {

                /** EventEthereumTx amount */
                amount?: (string|null);

                /** EventEthereumTx eth_hash */
                eth_hash?: (string|null);

                /** EventEthereumTx index */
                index?: (string|null);

                /** EventEthereumTx gas_used */
                gas_used?: (string|null);

                /** EventEthereumTx hash */
                hash?: (string|null);

                /** EventEthereumTx recipient */
                recipient?: (string|null);

                /** EventEthereumTx eth_tx_failed */
                eth_tx_failed?: (string|null);
            }

            /** Represents an EventEthereumTx. */
            class EventEthereumTx implements IEventEthereumTx {

                /**
                 * Constructs a new EventEthereumTx.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IEventEthereumTx);

                /** EventEthereumTx amount. */
                public amount: string;

                /** EventEthereumTx eth_hash. */
                public eth_hash: string;

                /** EventEthereumTx index. */
                public index: string;

                /** EventEthereumTx gas_used. */
                public gas_used: string;

                /** EventEthereumTx hash. */
                public hash: string;

                /** EventEthereumTx recipient. */
                public recipient: string;

                /** EventEthereumTx eth_tx_failed. */
                public eth_tx_failed: string;

                /**
                 * Encodes the specified EventEthereumTx message. Does not implicitly {@link ethermint.evm.v1.EventEthereumTx.verify|verify} messages.
                 * @param message EventEthereumTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IEventEthereumTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EventEthereumTx message, length delimited. Does not implicitly {@link ethermint.evm.v1.EventEthereumTx.verify|verify} messages.
                 * @param message EventEthereumTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IEventEthereumTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EventEthereumTx message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EventEthereumTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.EventEthereumTx;

                /**
                 * Decodes an EventEthereumTx message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EventEthereumTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.EventEthereumTx;

                /**
                 * Verifies an EventEthereumTx message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EventEthereumTx message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EventEthereumTx
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.EventEthereumTx;

                /**
                 * Creates a plain object from an EventEthereumTx message. Also converts values to other types if specified.
                 * @param message EventEthereumTx
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.EventEthereumTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EventEthereumTx to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EventTxLog. */
            interface IEventTxLog {

                /** EventTxLog tx_logs */
                tx_logs?: (string[]|null);
            }

            /** Represents an EventTxLog. */
            class EventTxLog implements IEventTxLog {

                /**
                 * Constructs a new EventTxLog.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IEventTxLog);

                /** EventTxLog tx_logs. */
                public tx_logs: string[];

                /**
                 * Encodes the specified EventTxLog message. Does not implicitly {@link ethermint.evm.v1.EventTxLog.verify|verify} messages.
                 * @param message EventTxLog message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IEventTxLog, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EventTxLog message, length delimited. Does not implicitly {@link ethermint.evm.v1.EventTxLog.verify|verify} messages.
                 * @param message EventTxLog message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IEventTxLog, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EventTxLog message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EventTxLog
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.EventTxLog;

                /**
                 * Decodes an EventTxLog message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EventTxLog
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.EventTxLog;

                /**
                 * Verifies an EventTxLog message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EventTxLog message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EventTxLog
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.EventTxLog;

                /**
                 * Creates a plain object from an EventTxLog message. Also converts values to other types if specified.
                 * @param message EventTxLog
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.EventTxLog, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EventTxLog to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EventMessage. */
            interface IEventMessage {

                /** EventMessage module */
                module?: (string|null);

                /** EventMessage sender */
                sender?: (string|null);

                /** EventMessage tx_type */
                tx_type?: (string|null);
            }

            /** Represents an EventMessage. */
            class EventMessage implements IEventMessage {

                /**
                 * Constructs a new EventMessage.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IEventMessage);

                /** EventMessage module. */
                public module: string;

                /** EventMessage sender. */
                public sender: string;

                /** EventMessage tx_type. */
                public tx_type: string;

                /**
                 * Encodes the specified EventMessage message. Does not implicitly {@link ethermint.evm.v1.EventMessage.verify|verify} messages.
                 * @param message EventMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IEventMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EventMessage message, length delimited. Does not implicitly {@link ethermint.evm.v1.EventMessage.verify|verify} messages.
                 * @param message EventMessage message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IEventMessage, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EventMessage message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EventMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.EventMessage;

                /**
                 * Decodes an EventMessage message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EventMessage
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.EventMessage;

                /**
                 * Verifies an EventMessage message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EventMessage message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EventMessage
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.EventMessage;

                /**
                 * Creates a plain object from an EventMessage message. Also converts values to other types if specified.
                 * @param message EventMessage
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.EventMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EventMessage to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EventBlockBloom. */
            interface IEventBlockBloom {

                /** EventBlockBloom bloom */
                bloom?: (string|null);
            }

            /** Represents an EventBlockBloom. */
            class EventBlockBloom implements IEventBlockBloom {

                /**
                 * Constructs a new EventBlockBloom.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IEventBlockBloom);

                /** EventBlockBloom bloom. */
                public bloom: string;

                /**
                 * Encodes the specified EventBlockBloom message. Does not implicitly {@link ethermint.evm.v1.EventBlockBloom.verify|verify} messages.
                 * @param message EventBlockBloom message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IEventBlockBloom, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EventBlockBloom message, length delimited. Does not implicitly {@link ethermint.evm.v1.EventBlockBloom.verify|verify} messages.
                 * @param message EventBlockBloom message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IEventBlockBloom, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EventBlockBloom message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EventBlockBloom
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.EventBlockBloom;

                /**
                 * Decodes an EventBlockBloom message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EventBlockBloom
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.EventBlockBloom;

                /**
                 * Verifies an EventBlockBloom message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EventBlockBloom message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EventBlockBloom
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.EventBlockBloom;

                /**
                 * Creates a plain object from an EventBlockBloom message. Also converts values to other types if specified.
                 * @param message EventBlockBloom
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.EventBlockBloom, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EventBlockBloom to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Represents a Query */
            class Query extends $protobuf.rpc.Service {

                /**
                 * Constructs a new Query service.
                 * @param rpcImpl RPC implementation
                 * @param [requestDelimited=false] Whether requests are length-delimited
                 * @param [responseDelimited=false] Whether responses are length-delimited
                 */
                constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                /**
                 * Calls Account.
                 * @param request QueryAccountRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryAccountResponse
                 */
                public account(request: ethermint.evm.v1.IQueryAccountRequest, callback: ethermint.evm.v1.Query.AccountCallback): void;

                /**
                 * Calls Account.
                 * @param request QueryAccountRequest message or plain object
                 * @returns Promise
                 */
                public account(request: ethermint.evm.v1.IQueryAccountRequest): Promise<ethermint.evm.v1.QueryAccountResponse>;

                /**
                 * Calls CosmosAccount.
                 * @param request QueryCosmosAccountRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryCosmosAccountResponse
                 */
                public cosmosAccount(request: ethermint.evm.v1.IQueryCosmosAccountRequest, callback: ethermint.evm.v1.Query.CosmosAccountCallback): void;

                /**
                 * Calls CosmosAccount.
                 * @param request QueryCosmosAccountRequest message or plain object
                 * @returns Promise
                 */
                public cosmosAccount(request: ethermint.evm.v1.IQueryCosmosAccountRequest): Promise<ethermint.evm.v1.QueryCosmosAccountResponse>;

                /**
                 * Calls ValidatorAccount.
                 * @param request QueryValidatorAccountRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryValidatorAccountResponse
                 */
                public validatorAccount(request: ethermint.evm.v1.IQueryValidatorAccountRequest, callback: ethermint.evm.v1.Query.ValidatorAccountCallback): void;

                /**
                 * Calls ValidatorAccount.
                 * @param request QueryValidatorAccountRequest message or plain object
                 * @returns Promise
                 */
                public validatorAccount(request: ethermint.evm.v1.IQueryValidatorAccountRequest): Promise<ethermint.evm.v1.QueryValidatorAccountResponse>;

                /**
                 * Calls Balance.
                 * @param request QueryBalanceRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryBalanceResponse
                 */
                public balance(request: ethermint.evm.v1.IQueryBalanceRequest, callback: ethermint.evm.v1.Query.BalanceCallback): void;

                /**
                 * Calls Balance.
                 * @param request QueryBalanceRequest message or plain object
                 * @returns Promise
                 */
                public balance(request: ethermint.evm.v1.IQueryBalanceRequest): Promise<ethermint.evm.v1.QueryBalanceResponse>;

                /**
                 * Calls Storage.
                 * @param request QueryStorageRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryStorageResponse
                 */
                public storage(request: ethermint.evm.v1.IQueryStorageRequest, callback: ethermint.evm.v1.Query.StorageCallback): void;

                /**
                 * Calls Storage.
                 * @param request QueryStorageRequest message or plain object
                 * @returns Promise
                 */
                public storage(request: ethermint.evm.v1.IQueryStorageRequest): Promise<ethermint.evm.v1.QueryStorageResponse>;

                /**
                 * Calls Code.
                 * @param request QueryCodeRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryCodeResponse
                 */
                public code(request: ethermint.evm.v1.IQueryCodeRequest, callback: ethermint.evm.v1.Query.CodeCallback): void;

                /**
                 * Calls Code.
                 * @param request QueryCodeRequest message or plain object
                 * @returns Promise
                 */
                public code(request: ethermint.evm.v1.IQueryCodeRequest): Promise<ethermint.evm.v1.QueryCodeResponse>;

                /**
                 * Calls Params.
                 * @param request QueryParamsRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryParamsResponse
                 */
                public params(request: ethermint.evm.v1.IQueryParamsRequest, callback: ethermint.evm.v1.Query.ParamsCallback): void;

                /**
                 * Calls Params.
                 * @param request QueryParamsRequest message or plain object
                 * @returns Promise
                 */
                public params(request: ethermint.evm.v1.IQueryParamsRequest): Promise<ethermint.evm.v1.QueryParamsResponse>;

                /**
                 * Calls EthCall.
                 * @param request EthCallRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and MsgEthereumTxResponse
                 */
                public ethCall(request: ethermint.evm.v1.IEthCallRequest, callback: ethermint.evm.v1.Query.EthCallCallback): void;

                /**
                 * Calls EthCall.
                 * @param request EthCallRequest message or plain object
                 * @returns Promise
                 */
                public ethCall(request: ethermint.evm.v1.IEthCallRequest): Promise<ethermint.evm.v1.MsgEthereumTxResponse>;

                /**
                 * Calls EstimateGas.
                 * @param request EthCallRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and EstimateGasResponse
                 */
                public estimateGas(request: ethermint.evm.v1.IEthCallRequest, callback: ethermint.evm.v1.Query.EstimateGasCallback): void;

                /**
                 * Calls EstimateGas.
                 * @param request EthCallRequest message or plain object
                 * @returns Promise
                 */
                public estimateGas(request: ethermint.evm.v1.IEthCallRequest): Promise<ethermint.evm.v1.EstimateGasResponse>;

                /**
                 * Calls TraceTx.
                 * @param request QueryTraceTxRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryTraceTxResponse
                 */
                public traceTx(request: ethermint.evm.v1.IQueryTraceTxRequest, callback: ethermint.evm.v1.Query.TraceTxCallback): void;

                /**
                 * Calls TraceTx.
                 * @param request QueryTraceTxRequest message or plain object
                 * @returns Promise
                 */
                public traceTx(request: ethermint.evm.v1.IQueryTraceTxRequest): Promise<ethermint.evm.v1.QueryTraceTxResponse>;

                /**
                 * Calls TraceBlock.
                 * @param request QueryTraceBlockRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryTraceBlockResponse
                 */
                public traceBlock(request: ethermint.evm.v1.IQueryTraceBlockRequest, callback: ethermint.evm.v1.Query.TraceBlockCallback): void;

                /**
                 * Calls TraceBlock.
                 * @param request QueryTraceBlockRequest message or plain object
                 * @returns Promise
                 */
                public traceBlock(request: ethermint.evm.v1.IQueryTraceBlockRequest): Promise<ethermint.evm.v1.QueryTraceBlockResponse>;

                /**
                 * Calls BaseFee.
                 * @param request QueryBaseFeeRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryBaseFeeResponse
                 */
                public baseFee(request: ethermint.evm.v1.IQueryBaseFeeRequest, callback: ethermint.evm.v1.Query.BaseFeeCallback): void;

                /**
                 * Calls BaseFee.
                 * @param request QueryBaseFeeRequest message or plain object
                 * @returns Promise
                 */
                public baseFee(request: ethermint.evm.v1.IQueryBaseFeeRequest): Promise<ethermint.evm.v1.QueryBaseFeeResponse>;
            }

            namespace Query {

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#account}.
                 * @param error Error, if any
                 * @param [response] QueryAccountResponse
                 */
                type AccountCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryAccountResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#cosmosAccount}.
                 * @param error Error, if any
                 * @param [response] QueryCosmosAccountResponse
                 */
                type CosmosAccountCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryCosmosAccountResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#validatorAccount}.
                 * @param error Error, if any
                 * @param [response] QueryValidatorAccountResponse
                 */
                type ValidatorAccountCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryValidatorAccountResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#balance}.
                 * @param error Error, if any
                 * @param [response] QueryBalanceResponse
                 */
                type BalanceCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryBalanceResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#storage}.
                 * @param error Error, if any
                 * @param [response] QueryStorageResponse
                 */
                type StorageCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryStorageResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#code}.
                 * @param error Error, if any
                 * @param [response] QueryCodeResponse
                 */
                type CodeCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryCodeResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#params}.
                 * @param error Error, if any
                 * @param [response] QueryParamsResponse
                 */
                type ParamsCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryParamsResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#ethCall}.
                 * @param error Error, if any
                 * @param [response] MsgEthereumTxResponse
                 */
                type EthCallCallback = (error: (Error|null), response?: ethermint.evm.v1.MsgEthereumTxResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#estimateGas}.
                 * @param error Error, if any
                 * @param [response] EstimateGasResponse
                 */
                type EstimateGasCallback = (error: (Error|null), response?: ethermint.evm.v1.EstimateGasResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#traceTx}.
                 * @param error Error, if any
                 * @param [response] QueryTraceTxResponse
                 */
                type TraceTxCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryTraceTxResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#traceBlock}.
                 * @param error Error, if any
                 * @param [response] QueryTraceBlockResponse
                 */
                type TraceBlockCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryTraceBlockResponse) => void;

                /**
                 * Callback as used by {@link ethermint.evm.v1.Query#baseFee}.
                 * @param error Error, if any
                 * @param [response] QueryBaseFeeResponse
                 */
                type BaseFeeCallback = (error: (Error|null), response?: ethermint.evm.v1.QueryBaseFeeResponse) => void;
            }

            /** Properties of a QueryAccountRequest. */
            interface IQueryAccountRequest {

                /** QueryAccountRequest address */
                address?: (string|null);
            }

            /** Represents a QueryAccountRequest. */
            class QueryAccountRequest implements IQueryAccountRequest {

                /**
                 * Constructs a new QueryAccountRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryAccountRequest);

                /** QueryAccountRequest address. */
                public address: string;

                /**
                 * Encodes the specified QueryAccountRequest message. Does not implicitly {@link ethermint.evm.v1.QueryAccountRequest.verify|verify} messages.
                 * @param message QueryAccountRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryAccountRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryAccountRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryAccountRequest.verify|verify} messages.
                 * @param message QueryAccountRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryAccountRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryAccountRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryAccountRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryAccountRequest;

                /**
                 * Decodes a QueryAccountRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryAccountRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryAccountRequest;

                /**
                 * Verifies a QueryAccountRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryAccountRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryAccountRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryAccountRequest;

                /**
                 * Creates a plain object from a QueryAccountRequest message. Also converts values to other types if specified.
                 * @param message QueryAccountRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryAccountRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryAccountRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryAccountResponse. */
            interface IQueryAccountResponse {

                /** QueryAccountResponse balance */
                balance?: (string|null);

                /** QueryAccountResponse code_hash */
                code_hash?: (string|null);

                /** QueryAccountResponse nonce */
                nonce?: (number|null);
            }

            /** Represents a QueryAccountResponse. */
            class QueryAccountResponse implements IQueryAccountResponse {

                /**
                 * Constructs a new QueryAccountResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryAccountResponse);

                /** QueryAccountResponse balance. */
                public balance: string;

                /** QueryAccountResponse code_hash. */
                public code_hash: string;

                /** QueryAccountResponse nonce. */
                public nonce: number;

                /**
                 * Encodes the specified QueryAccountResponse message. Does not implicitly {@link ethermint.evm.v1.QueryAccountResponse.verify|verify} messages.
                 * @param message QueryAccountResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryAccountResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryAccountResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryAccountResponse.verify|verify} messages.
                 * @param message QueryAccountResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryAccountResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryAccountResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryAccountResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryAccountResponse;

                /**
                 * Decodes a QueryAccountResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryAccountResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryAccountResponse;

                /**
                 * Verifies a QueryAccountResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryAccountResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryAccountResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryAccountResponse;

                /**
                 * Creates a plain object from a QueryAccountResponse message. Also converts values to other types if specified.
                 * @param message QueryAccountResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryAccountResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryAccountResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryCosmosAccountRequest. */
            interface IQueryCosmosAccountRequest {

                /** QueryCosmosAccountRequest address */
                address?: (string|null);
            }

            /** Represents a QueryCosmosAccountRequest. */
            class QueryCosmosAccountRequest implements IQueryCosmosAccountRequest {

                /**
                 * Constructs a new QueryCosmosAccountRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryCosmosAccountRequest);

                /** QueryCosmosAccountRequest address. */
                public address: string;

                /**
                 * Encodes the specified QueryCosmosAccountRequest message. Does not implicitly {@link ethermint.evm.v1.QueryCosmosAccountRequest.verify|verify} messages.
                 * @param message QueryCosmosAccountRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryCosmosAccountRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryCosmosAccountRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryCosmosAccountRequest.verify|verify} messages.
                 * @param message QueryCosmosAccountRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryCosmosAccountRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryCosmosAccountRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryCosmosAccountRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryCosmosAccountRequest;

                /**
                 * Decodes a QueryCosmosAccountRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryCosmosAccountRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryCosmosAccountRequest;

                /**
                 * Verifies a QueryCosmosAccountRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryCosmosAccountRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryCosmosAccountRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryCosmosAccountRequest;

                /**
                 * Creates a plain object from a QueryCosmosAccountRequest message. Also converts values to other types if specified.
                 * @param message QueryCosmosAccountRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryCosmosAccountRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryCosmosAccountRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryCosmosAccountResponse. */
            interface IQueryCosmosAccountResponse {

                /** QueryCosmosAccountResponse cosmos_address */
                cosmos_address?: (string|null);

                /** QueryCosmosAccountResponse sequence */
                sequence?: (number|null);

                /** QueryCosmosAccountResponse account_number */
                account_number?: (number|null);
            }

            /** Represents a QueryCosmosAccountResponse. */
            class QueryCosmosAccountResponse implements IQueryCosmosAccountResponse {

                /**
                 * Constructs a new QueryCosmosAccountResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryCosmosAccountResponse);

                /** QueryCosmosAccountResponse cosmos_address. */
                public cosmos_address: string;

                /** QueryCosmosAccountResponse sequence. */
                public sequence: number;

                /** QueryCosmosAccountResponse account_number. */
                public account_number: number;

                /**
                 * Encodes the specified QueryCosmosAccountResponse message. Does not implicitly {@link ethermint.evm.v1.QueryCosmosAccountResponse.verify|verify} messages.
                 * @param message QueryCosmosAccountResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryCosmosAccountResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryCosmosAccountResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryCosmosAccountResponse.verify|verify} messages.
                 * @param message QueryCosmosAccountResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryCosmosAccountResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryCosmosAccountResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryCosmosAccountResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryCosmosAccountResponse;

                /**
                 * Decodes a QueryCosmosAccountResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryCosmosAccountResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryCosmosAccountResponse;

                /**
                 * Verifies a QueryCosmosAccountResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryCosmosAccountResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryCosmosAccountResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryCosmosAccountResponse;

                /**
                 * Creates a plain object from a QueryCosmosAccountResponse message. Also converts values to other types if specified.
                 * @param message QueryCosmosAccountResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryCosmosAccountResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryCosmosAccountResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryValidatorAccountRequest. */
            interface IQueryValidatorAccountRequest {

                /** QueryValidatorAccountRequest cons_address */
                cons_address?: (string|null);
            }

            /** Represents a QueryValidatorAccountRequest. */
            class QueryValidatorAccountRequest implements IQueryValidatorAccountRequest {

                /**
                 * Constructs a new QueryValidatorAccountRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryValidatorAccountRequest);

                /** QueryValidatorAccountRequest cons_address. */
                public cons_address: string;

                /**
                 * Encodes the specified QueryValidatorAccountRequest message. Does not implicitly {@link ethermint.evm.v1.QueryValidatorAccountRequest.verify|verify} messages.
                 * @param message QueryValidatorAccountRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryValidatorAccountRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryValidatorAccountRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryValidatorAccountRequest.verify|verify} messages.
                 * @param message QueryValidatorAccountRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryValidatorAccountRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryValidatorAccountRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryValidatorAccountRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryValidatorAccountRequest;

                /**
                 * Decodes a QueryValidatorAccountRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryValidatorAccountRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryValidatorAccountRequest;

                /**
                 * Verifies a QueryValidatorAccountRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryValidatorAccountRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryValidatorAccountRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryValidatorAccountRequest;

                /**
                 * Creates a plain object from a QueryValidatorAccountRequest message. Also converts values to other types if specified.
                 * @param message QueryValidatorAccountRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryValidatorAccountRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryValidatorAccountRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryValidatorAccountResponse. */
            interface IQueryValidatorAccountResponse {

                /** QueryValidatorAccountResponse account_address */
                account_address?: (string|null);

                /** QueryValidatorAccountResponse sequence */
                sequence?: (number|null);

                /** QueryValidatorAccountResponse account_number */
                account_number?: (number|null);
            }

            /** Represents a QueryValidatorAccountResponse. */
            class QueryValidatorAccountResponse implements IQueryValidatorAccountResponse {

                /**
                 * Constructs a new QueryValidatorAccountResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryValidatorAccountResponse);

                /** QueryValidatorAccountResponse account_address. */
                public account_address: string;

                /** QueryValidatorAccountResponse sequence. */
                public sequence: number;

                /** QueryValidatorAccountResponse account_number. */
                public account_number: number;

                /**
                 * Encodes the specified QueryValidatorAccountResponse message. Does not implicitly {@link ethermint.evm.v1.QueryValidatorAccountResponse.verify|verify} messages.
                 * @param message QueryValidatorAccountResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryValidatorAccountResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryValidatorAccountResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryValidatorAccountResponse.verify|verify} messages.
                 * @param message QueryValidatorAccountResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryValidatorAccountResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryValidatorAccountResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryValidatorAccountResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryValidatorAccountResponse;

                /**
                 * Decodes a QueryValidatorAccountResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryValidatorAccountResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryValidatorAccountResponse;

                /**
                 * Verifies a QueryValidatorAccountResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryValidatorAccountResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryValidatorAccountResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryValidatorAccountResponse;

                /**
                 * Creates a plain object from a QueryValidatorAccountResponse message. Also converts values to other types if specified.
                 * @param message QueryValidatorAccountResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryValidatorAccountResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryValidatorAccountResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryBalanceRequest. */
            interface IQueryBalanceRequest {

                /** QueryBalanceRequest address */
                address?: (string|null);
            }

            /** Represents a QueryBalanceRequest. */
            class QueryBalanceRequest implements IQueryBalanceRequest {

                /**
                 * Constructs a new QueryBalanceRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryBalanceRequest);

                /** QueryBalanceRequest address. */
                public address: string;

                /**
                 * Encodes the specified QueryBalanceRequest message. Does not implicitly {@link ethermint.evm.v1.QueryBalanceRequest.verify|verify} messages.
                 * @param message QueryBalanceRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryBalanceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryBalanceRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryBalanceRequest.verify|verify} messages.
                 * @param message QueryBalanceRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryBalanceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryBalanceRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryBalanceRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryBalanceRequest;

                /**
                 * Decodes a QueryBalanceRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryBalanceRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryBalanceRequest;

                /**
                 * Verifies a QueryBalanceRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryBalanceRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryBalanceRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryBalanceRequest;

                /**
                 * Creates a plain object from a QueryBalanceRequest message. Also converts values to other types if specified.
                 * @param message QueryBalanceRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryBalanceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryBalanceRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryBalanceResponse. */
            interface IQueryBalanceResponse {

                /** QueryBalanceResponse balance */
                balance?: (string|null);
            }

            /** Represents a QueryBalanceResponse. */
            class QueryBalanceResponse implements IQueryBalanceResponse {

                /**
                 * Constructs a new QueryBalanceResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryBalanceResponse);

                /** QueryBalanceResponse balance. */
                public balance: string;

                /**
                 * Encodes the specified QueryBalanceResponse message. Does not implicitly {@link ethermint.evm.v1.QueryBalanceResponse.verify|verify} messages.
                 * @param message QueryBalanceResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryBalanceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryBalanceResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryBalanceResponse.verify|verify} messages.
                 * @param message QueryBalanceResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryBalanceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryBalanceResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryBalanceResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryBalanceResponse;

                /**
                 * Decodes a QueryBalanceResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryBalanceResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryBalanceResponse;

                /**
                 * Verifies a QueryBalanceResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryBalanceResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryBalanceResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryBalanceResponse;

                /**
                 * Creates a plain object from a QueryBalanceResponse message. Also converts values to other types if specified.
                 * @param message QueryBalanceResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryBalanceResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryBalanceResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryStorageRequest. */
            interface IQueryStorageRequest {

                /** QueryStorageRequest address */
                address?: (string|null);

                /** QueryStorageRequest key */
                key?: (string|null);
            }

            /** Represents a QueryStorageRequest. */
            class QueryStorageRequest implements IQueryStorageRequest {

                /**
                 * Constructs a new QueryStorageRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryStorageRequest);

                /** QueryStorageRequest address. */
                public address: string;

                /** QueryStorageRequest key. */
                public key: string;

                /**
                 * Encodes the specified QueryStorageRequest message. Does not implicitly {@link ethermint.evm.v1.QueryStorageRequest.verify|verify} messages.
                 * @param message QueryStorageRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryStorageRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryStorageRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryStorageRequest.verify|verify} messages.
                 * @param message QueryStorageRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryStorageRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryStorageRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryStorageRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryStorageRequest;

                /**
                 * Decodes a QueryStorageRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryStorageRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryStorageRequest;

                /**
                 * Verifies a QueryStorageRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryStorageRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryStorageRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryStorageRequest;

                /**
                 * Creates a plain object from a QueryStorageRequest message. Also converts values to other types if specified.
                 * @param message QueryStorageRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryStorageRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryStorageRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryStorageResponse. */
            interface IQueryStorageResponse {

                /** QueryStorageResponse value */
                value?: (string|null);
            }

            /** Represents a QueryStorageResponse. */
            class QueryStorageResponse implements IQueryStorageResponse {

                /**
                 * Constructs a new QueryStorageResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryStorageResponse);

                /** QueryStorageResponse value. */
                public value: string;

                /**
                 * Encodes the specified QueryStorageResponse message. Does not implicitly {@link ethermint.evm.v1.QueryStorageResponse.verify|verify} messages.
                 * @param message QueryStorageResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryStorageResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryStorageResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryStorageResponse.verify|verify} messages.
                 * @param message QueryStorageResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryStorageResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryStorageResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryStorageResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryStorageResponse;

                /**
                 * Decodes a QueryStorageResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryStorageResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryStorageResponse;

                /**
                 * Verifies a QueryStorageResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryStorageResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryStorageResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryStorageResponse;

                /**
                 * Creates a plain object from a QueryStorageResponse message. Also converts values to other types if specified.
                 * @param message QueryStorageResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryStorageResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryStorageResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryCodeRequest. */
            interface IQueryCodeRequest {

                /** QueryCodeRequest address */
                address?: (string|null);
            }

            /** Represents a QueryCodeRequest. */
            class QueryCodeRequest implements IQueryCodeRequest {

                /**
                 * Constructs a new QueryCodeRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryCodeRequest);

                /** QueryCodeRequest address. */
                public address: string;

                /**
                 * Encodes the specified QueryCodeRequest message. Does not implicitly {@link ethermint.evm.v1.QueryCodeRequest.verify|verify} messages.
                 * @param message QueryCodeRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryCodeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryCodeRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryCodeRequest.verify|verify} messages.
                 * @param message QueryCodeRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryCodeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryCodeRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryCodeRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryCodeRequest;

                /**
                 * Decodes a QueryCodeRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryCodeRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryCodeRequest;

                /**
                 * Verifies a QueryCodeRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryCodeRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryCodeRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryCodeRequest;

                /**
                 * Creates a plain object from a QueryCodeRequest message. Also converts values to other types if specified.
                 * @param message QueryCodeRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryCodeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryCodeRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryCodeResponse. */
            interface IQueryCodeResponse {

                /** QueryCodeResponse code */
                code?: (Uint8Array|null);
            }

            /** Represents a QueryCodeResponse. */
            class QueryCodeResponse implements IQueryCodeResponse {

                /**
                 * Constructs a new QueryCodeResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryCodeResponse);

                /** QueryCodeResponse code. */
                public code: Uint8Array;

                /**
                 * Encodes the specified QueryCodeResponse message. Does not implicitly {@link ethermint.evm.v1.QueryCodeResponse.verify|verify} messages.
                 * @param message QueryCodeResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryCodeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryCodeResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryCodeResponse.verify|verify} messages.
                 * @param message QueryCodeResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryCodeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryCodeResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryCodeResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryCodeResponse;

                /**
                 * Decodes a QueryCodeResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryCodeResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryCodeResponse;

                /**
                 * Verifies a QueryCodeResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryCodeResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryCodeResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryCodeResponse;

                /**
                 * Creates a plain object from a QueryCodeResponse message. Also converts values to other types if specified.
                 * @param message QueryCodeResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryCodeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryCodeResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryTxLogsRequest. */
            interface IQueryTxLogsRequest {

                /** QueryTxLogsRequest hash */
                hash?: (string|null);

                /** QueryTxLogsRequest pagination */
                pagination?: (cosmos.base.query.v1beta1.IPageRequest|null);
            }

            /** Represents a QueryTxLogsRequest. */
            class QueryTxLogsRequest implements IQueryTxLogsRequest {

                /**
                 * Constructs a new QueryTxLogsRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryTxLogsRequest);

                /** QueryTxLogsRequest hash. */
                public hash: string;

                /** QueryTxLogsRequest pagination. */
                public pagination?: (cosmos.base.query.v1beta1.IPageRequest|null);

                /**
                 * Encodes the specified QueryTxLogsRequest message. Does not implicitly {@link ethermint.evm.v1.QueryTxLogsRequest.verify|verify} messages.
                 * @param message QueryTxLogsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryTxLogsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryTxLogsRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryTxLogsRequest.verify|verify} messages.
                 * @param message QueryTxLogsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryTxLogsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryTxLogsRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryTxLogsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryTxLogsRequest;

                /**
                 * Decodes a QueryTxLogsRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryTxLogsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryTxLogsRequest;

                /**
                 * Verifies a QueryTxLogsRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryTxLogsRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryTxLogsRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryTxLogsRequest;

                /**
                 * Creates a plain object from a QueryTxLogsRequest message. Also converts values to other types if specified.
                 * @param message QueryTxLogsRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryTxLogsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryTxLogsRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryTxLogsResponse. */
            interface IQueryTxLogsResponse {

                /** QueryTxLogsResponse logs */
                logs?: (ethermint.evm.v1.ILog[]|null);

                /** QueryTxLogsResponse pagination */
                pagination?: (cosmos.base.query.v1beta1.IPageResponse|null);
            }

            /** Represents a QueryTxLogsResponse. */
            class QueryTxLogsResponse implements IQueryTxLogsResponse {

                /**
                 * Constructs a new QueryTxLogsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryTxLogsResponse);

                /** QueryTxLogsResponse logs. */
                public logs: ethermint.evm.v1.ILog[];

                /** QueryTxLogsResponse pagination. */
                public pagination?: (cosmos.base.query.v1beta1.IPageResponse|null);

                /**
                 * Encodes the specified QueryTxLogsResponse message. Does not implicitly {@link ethermint.evm.v1.QueryTxLogsResponse.verify|verify} messages.
                 * @param message QueryTxLogsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryTxLogsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryTxLogsResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryTxLogsResponse.verify|verify} messages.
                 * @param message QueryTxLogsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryTxLogsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryTxLogsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryTxLogsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryTxLogsResponse;

                /**
                 * Decodes a QueryTxLogsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryTxLogsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryTxLogsResponse;

                /**
                 * Verifies a QueryTxLogsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryTxLogsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryTxLogsResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryTxLogsResponse;

                /**
                 * Creates a plain object from a QueryTxLogsResponse message. Also converts values to other types if specified.
                 * @param message QueryTxLogsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryTxLogsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryTxLogsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryParamsRequest. */
            interface IQueryParamsRequest {
            }

            /** Represents a QueryParamsRequest. */
            class QueryParamsRequest implements IQueryParamsRequest {

                /**
                 * Constructs a new QueryParamsRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryParamsRequest);

                /**
                 * Encodes the specified QueryParamsRequest message. Does not implicitly {@link ethermint.evm.v1.QueryParamsRequest.verify|verify} messages.
                 * @param message QueryParamsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryParamsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryParamsRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryParamsRequest.verify|verify} messages.
                 * @param message QueryParamsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryParamsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryParamsRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryParamsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryParamsRequest;

                /**
                 * Decodes a QueryParamsRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryParamsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryParamsRequest;

                /**
                 * Verifies a QueryParamsRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryParamsRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryParamsRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryParamsRequest;

                /**
                 * Creates a plain object from a QueryParamsRequest message. Also converts values to other types if specified.
                 * @param message QueryParamsRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryParamsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryParamsRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryParamsResponse. */
            interface IQueryParamsResponse {

                /** QueryParamsResponse params */
                params?: (ethermint.evm.v1.IParams|null);
            }

            /** Represents a QueryParamsResponse. */
            class QueryParamsResponse implements IQueryParamsResponse {

                /**
                 * Constructs a new QueryParamsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryParamsResponse);

                /** QueryParamsResponse params. */
                public params?: (ethermint.evm.v1.IParams|null);

                /**
                 * Encodes the specified QueryParamsResponse message. Does not implicitly {@link ethermint.evm.v1.QueryParamsResponse.verify|verify} messages.
                 * @param message QueryParamsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryParamsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryParamsResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryParamsResponse.verify|verify} messages.
                 * @param message QueryParamsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryParamsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryParamsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryParamsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryParamsResponse;

                /**
                 * Decodes a QueryParamsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryParamsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryParamsResponse;

                /**
                 * Verifies a QueryParamsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryParamsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryParamsResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryParamsResponse;

                /**
                 * Creates a plain object from a QueryParamsResponse message. Also converts values to other types if specified.
                 * @param message QueryParamsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryParamsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryParamsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EthCallRequest. */
            interface IEthCallRequest {

                /** EthCallRequest args */
                args?: (Uint8Array|null);

                /** EthCallRequest gas_cap */
                gas_cap?: (number|null);

                /** EthCallRequest proposer_address */
                proposer_address?: (Uint8Array|null);

                /** EthCallRequest chain_id */
                chain_id?: (number|null);
            }

            /** Represents an EthCallRequest. */
            class EthCallRequest implements IEthCallRequest {

                /**
                 * Constructs a new EthCallRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IEthCallRequest);

                /** EthCallRequest args. */
                public args: Uint8Array;

                /** EthCallRequest gas_cap. */
                public gas_cap: number;

                /** EthCallRequest proposer_address. */
                public proposer_address: Uint8Array;

                /** EthCallRequest chain_id. */
                public chain_id: number;

                /**
                 * Encodes the specified EthCallRequest message. Does not implicitly {@link ethermint.evm.v1.EthCallRequest.verify|verify} messages.
                 * @param message EthCallRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IEthCallRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EthCallRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.EthCallRequest.verify|verify} messages.
                 * @param message EthCallRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IEthCallRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EthCallRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EthCallRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.EthCallRequest;

                /**
                 * Decodes an EthCallRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EthCallRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.EthCallRequest;

                /**
                 * Verifies an EthCallRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EthCallRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EthCallRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.EthCallRequest;

                /**
                 * Creates a plain object from an EthCallRequest message. Also converts values to other types if specified.
                 * @param message EthCallRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.EthCallRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EthCallRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EstimateGasResponse. */
            interface IEstimateGasResponse {

                /** EstimateGasResponse gas */
                gas?: (number|null);
            }

            /** Represents an EstimateGasResponse. */
            class EstimateGasResponse implements IEstimateGasResponse {

                /**
                 * Constructs a new EstimateGasResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IEstimateGasResponse);

                /** EstimateGasResponse gas. */
                public gas: number;

                /**
                 * Encodes the specified EstimateGasResponse message. Does not implicitly {@link ethermint.evm.v1.EstimateGasResponse.verify|verify} messages.
                 * @param message EstimateGasResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IEstimateGasResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EstimateGasResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.EstimateGasResponse.verify|verify} messages.
                 * @param message EstimateGasResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IEstimateGasResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EstimateGasResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EstimateGasResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.EstimateGasResponse;

                /**
                 * Decodes an EstimateGasResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EstimateGasResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.EstimateGasResponse;

                /**
                 * Verifies an EstimateGasResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EstimateGasResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EstimateGasResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.EstimateGasResponse;

                /**
                 * Creates a plain object from an EstimateGasResponse message. Also converts values to other types if specified.
                 * @param message EstimateGasResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.EstimateGasResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EstimateGasResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryTraceTxRequest. */
            interface IQueryTraceTxRequest {

                /** QueryTraceTxRequest msg */
                msg?: (ethermint.evm.v1.IMsgEthereumTx|null);

                /** QueryTraceTxRequest trace_config */
                trace_config?: (ethermint.evm.v1.ITraceConfig|null);

                /** QueryTraceTxRequest predecessors */
                predecessors?: (ethermint.evm.v1.IMsgEthereumTx[]|null);

                /** QueryTraceTxRequest block_number */
                block_number?: (number|null);

                /** QueryTraceTxRequest block_hash */
                block_hash?: (string|null);

                /** QueryTraceTxRequest block_time */
                block_time?: (google.protobuf.ITimestamp|null);

                /** QueryTraceTxRequest proposer_address */
                proposer_address?: (Uint8Array|null);

                /** QueryTraceTxRequest chain_id */
                chain_id?: (number|null);
            }

            /** Represents a QueryTraceTxRequest. */
            class QueryTraceTxRequest implements IQueryTraceTxRequest {

                /**
                 * Constructs a new QueryTraceTxRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryTraceTxRequest);

                /** QueryTraceTxRequest msg. */
                public msg?: (ethermint.evm.v1.IMsgEthereumTx|null);

                /** QueryTraceTxRequest trace_config. */
                public trace_config?: (ethermint.evm.v1.ITraceConfig|null);

                /** QueryTraceTxRequest predecessors. */
                public predecessors: ethermint.evm.v1.IMsgEthereumTx[];

                /** QueryTraceTxRequest block_number. */
                public block_number: number;

                /** QueryTraceTxRequest block_hash. */
                public block_hash: string;

                /** QueryTraceTxRequest block_time. */
                public block_time?: (google.protobuf.ITimestamp|null);

                /** QueryTraceTxRequest proposer_address. */
                public proposer_address: Uint8Array;

                /** QueryTraceTxRequest chain_id. */
                public chain_id: number;

                /**
                 * Encodes the specified QueryTraceTxRequest message. Does not implicitly {@link ethermint.evm.v1.QueryTraceTxRequest.verify|verify} messages.
                 * @param message QueryTraceTxRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryTraceTxRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryTraceTxRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryTraceTxRequest.verify|verify} messages.
                 * @param message QueryTraceTxRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryTraceTxRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryTraceTxRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryTraceTxRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryTraceTxRequest;

                /**
                 * Decodes a QueryTraceTxRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryTraceTxRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryTraceTxRequest;

                /**
                 * Verifies a QueryTraceTxRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryTraceTxRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryTraceTxRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryTraceTxRequest;

                /**
                 * Creates a plain object from a QueryTraceTxRequest message. Also converts values to other types if specified.
                 * @param message QueryTraceTxRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryTraceTxRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryTraceTxRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryTraceTxResponse. */
            interface IQueryTraceTxResponse {

                /** QueryTraceTxResponse data */
                data?: (Uint8Array|null);
            }

            /** Represents a QueryTraceTxResponse. */
            class QueryTraceTxResponse implements IQueryTraceTxResponse {

                /**
                 * Constructs a new QueryTraceTxResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryTraceTxResponse);

                /** QueryTraceTxResponse data. */
                public data: Uint8Array;

                /**
                 * Encodes the specified QueryTraceTxResponse message. Does not implicitly {@link ethermint.evm.v1.QueryTraceTxResponse.verify|verify} messages.
                 * @param message QueryTraceTxResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryTraceTxResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryTraceTxResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryTraceTxResponse.verify|verify} messages.
                 * @param message QueryTraceTxResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryTraceTxResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryTraceTxResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryTraceTxResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryTraceTxResponse;

                /**
                 * Decodes a QueryTraceTxResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryTraceTxResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryTraceTxResponse;

                /**
                 * Verifies a QueryTraceTxResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryTraceTxResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryTraceTxResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryTraceTxResponse;

                /**
                 * Creates a plain object from a QueryTraceTxResponse message. Also converts values to other types if specified.
                 * @param message QueryTraceTxResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryTraceTxResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryTraceTxResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryTraceBlockRequest. */
            interface IQueryTraceBlockRequest {

                /** QueryTraceBlockRequest txs */
                txs?: (ethermint.evm.v1.IMsgEthereumTx[]|null);

                /** QueryTraceBlockRequest trace_config */
                trace_config?: (ethermint.evm.v1.ITraceConfig|null);

                /** QueryTraceBlockRequest block_number */
                block_number?: (number|null);

                /** QueryTraceBlockRequest block_hash */
                block_hash?: (string|null);

                /** QueryTraceBlockRequest block_time */
                block_time?: (google.protobuf.ITimestamp|null);

                /** QueryTraceBlockRequest proposer_address */
                proposer_address?: (Uint8Array|null);

                /** QueryTraceBlockRequest chain_id */
                chain_id?: (number|null);
            }

            /** Represents a QueryTraceBlockRequest. */
            class QueryTraceBlockRequest implements IQueryTraceBlockRequest {

                /**
                 * Constructs a new QueryTraceBlockRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryTraceBlockRequest);

                /** QueryTraceBlockRequest txs. */
                public txs: ethermint.evm.v1.IMsgEthereumTx[];

                /** QueryTraceBlockRequest trace_config. */
                public trace_config?: (ethermint.evm.v1.ITraceConfig|null);

                /** QueryTraceBlockRequest block_number. */
                public block_number: number;

                /** QueryTraceBlockRequest block_hash. */
                public block_hash: string;

                /** QueryTraceBlockRequest block_time. */
                public block_time?: (google.protobuf.ITimestamp|null);

                /** QueryTraceBlockRequest proposer_address. */
                public proposer_address: Uint8Array;

                /** QueryTraceBlockRequest chain_id. */
                public chain_id: number;

                /**
                 * Encodes the specified QueryTraceBlockRequest message. Does not implicitly {@link ethermint.evm.v1.QueryTraceBlockRequest.verify|verify} messages.
                 * @param message QueryTraceBlockRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryTraceBlockRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryTraceBlockRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryTraceBlockRequest.verify|verify} messages.
                 * @param message QueryTraceBlockRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryTraceBlockRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryTraceBlockRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryTraceBlockRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryTraceBlockRequest;

                /**
                 * Decodes a QueryTraceBlockRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryTraceBlockRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryTraceBlockRequest;

                /**
                 * Verifies a QueryTraceBlockRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryTraceBlockRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryTraceBlockRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryTraceBlockRequest;

                /**
                 * Creates a plain object from a QueryTraceBlockRequest message. Also converts values to other types if specified.
                 * @param message QueryTraceBlockRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryTraceBlockRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryTraceBlockRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryTraceBlockResponse. */
            interface IQueryTraceBlockResponse {

                /** QueryTraceBlockResponse data */
                data?: (Uint8Array|null);
            }

            /** Represents a QueryTraceBlockResponse. */
            class QueryTraceBlockResponse implements IQueryTraceBlockResponse {

                /**
                 * Constructs a new QueryTraceBlockResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryTraceBlockResponse);

                /** QueryTraceBlockResponse data. */
                public data: Uint8Array;

                /**
                 * Encodes the specified QueryTraceBlockResponse message. Does not implicitly {@link ethermint.evm.v1.QueryTraceBlockResponse.verify|verify} messages.
                 * @param message QueryTraceBlockResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryTraceBlockResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryTraceBlockResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryTraceBlockResponse.verify|verify} messages.
                 * @param message QueryTraceBlockResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryTraceBlockResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryTraceBlockResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryTraceBlockResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryTraceBlockResponse;

                /**
                 * Decodes a QueryTraceBlockResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryTraceBlockResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryTraceBlockResponse;

                /**
                 * Verifies a QueryTraceBlockResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryTraceBlockResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryTraceBlockResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryTraceBlockResponse;

                /**
                 * Creates a plain object from a QueryTraceBlockResponse message. Also converts values to other types if specified.
                 * @param message QueryTraceBlockResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryTraceBlockResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryTraceBlockResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryBaseFeeRequest. */
            interface IQueryBaseFeeRequest {
            }

            /** Represents a QueryBaseFeeRequest. */
            class QueryBaseFeeRequest implements IQueryBaseFeeRequest {

                /**
                 * Constructs a new QueryBaseFeeRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryBaseFeeRequest);

                /**
                 * Encodes the specified QueryBaseFeeRequest message. Does not implicitly {@link ethermint.evm.v1.QueryBaseFeeRequest.verify|verify} messages.
                 * @param message QueryBaseFeeRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryBaseFeeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryBaseFeeRequest message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryBaseFeeRequest.verify|verify} messages.
                 * @param message QueryBaseFeeRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryBaseFeeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryBaseFeeRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryBaseFeeRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryBaseFeeRequest;

                /**
                 * Decodes a QueryBaseFeeRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryBaseFeeRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryBaseFeeRequest;

                /**
                 * Verifies a QueryBaseFeeRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryBaseFeeRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryBaseFeeRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryBaseFeeRequest;

                /**
                 * Creates a plain object from a QueryBaseFeeRequest message. Also converts values to other types if specified.
                 * @param message QueryBaseFeeRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryBaseFeeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryBaseFeeRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryBaseFeeResponse. */
            interface IQueryBaseFeeResponse {

                /** QueryBaseFeeResponse base_fee */
                base_fee?: (string|null);
            }

            /** Represents a QueryBaseFeeResponse. */
            class QueryBaseFeeResponse implements IQueryBaseFeeResponse {

                /**
                 * Constructs a new QueryBaseFeeResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IQueryBaseFeeResponse);

                /** QueryBaseFeeResponse base_fee. */
                public base_fee: string;

                /**
                 * Encodes the specified QueryBaseFeeResponse message. Does not implicitly {@link ethermint.evm.v1.QueryBaseFeeResponse.verify|verify} messages.
                 * @param message QueryBaseFeeResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IQueryBaseFeeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryBaseFeeResponse message, length delimited. Does not implicitly {@link ethermint.evm.v1.QueryBaseFeeResponse.verify|verify} messages.
                 * @param message QueryBaseFeeResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IQueryBaseFeeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryBaseFeeResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryBaseFeeResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.QueryBaseFeeResponse;

                /**
                 * Decodes a QueryBaseFeeResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryBaseFeeResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.QueryBaseFeeResponse;

                /**
                 * Verifies a QueryBaseFeeResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryBaseFeeResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryBaseFeeResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.QueryBaseFeeResponse;

                /**
                 * Creates a plain object from a QueryBaseFeeResponse message. Also converts values to other types if specified.
                 * @param message QueryBaseFeeResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.QueryBaseFeeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryBaseFeeResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a GenesisState. */
            interface IGenesisState {

                /** GenesisState accounts */
                accounts?: (ethermint.evm.v1.IGenesisAccount[]|null);

                /** GenesisState params */
                params?: (ethermint.evm.v1.IParams|null);
            }

            /** Represents a GenesisState. */
            class GenesisState implements IGenesisState {

                /**
                 * Constructs a new GenesisState.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IGenesisState);

                /** GenesisState accounts. */
                public accounts: ethermint.evm.v1.IGenesisAccount[];

                /** GenesisState params. */
                public params?: (ethermint.evm.v1.IParams|null);

                /**
                 * Encodes the specified GenesisState message. Does not implicitly {@link ethermint.evm.v1.GenesisState.verify|verify} messages.
                 * @param message GenesisState message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IGenesisState, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GenesisState message, length delimited. Does not implicitly {@link ethermint.evm.v1.GenesisState.verify|verify} messages.
                 * @param message GenesisState message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IGenesisState, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GenesisState message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GenesisState
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.GenesisState;

                /**
                 * Decodes a GenesisState message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GenesisState
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.GenesisState;

                /**
                 * Verifies a GenesisState message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GenesisState message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GenesisState
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.GenesisState;

                /**
                 * Creates a plain object from a GenesisState message. Also converts values to other types if specified.
                 * @param message GenesisState
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.GenesisState, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GenesisState to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a GenesisAccount. */
            interface IGenesisAccount {

                /** GenesisAccount address */
                address?: (string|null);

                /** GenesisAccount code */
                code?: (string|null);

                /** GenesisAccount storage */
                storage?: (ethermint.evm.v1.IState[]|null);
            }

            /** Represents a GenesisAccount. */
            class GenesisAccount implements IGenesisAccount {

                /**
                 * Constructs a new GenesisAccount.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.evm.v1.IGenesisAccount);

                /** GenesisAccount address. */
                public address: string;

                /** GenesisAccount code. */
                public code: string;

                /** GenesisAccount storage. */
                public storage: ethermint.evm.v1.IState[];

                /**
                 * Encodes the specified GenesisAccount message. Does not implicitly {@link ethermint.evm.v1.GenesisAccount.verify|verify} messages.
                 * @param message GenesisAccount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.evm.v1.IGenesisAccount, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GenesisAccount message, length delimited. Does not implicitly {@link ethermint.evm.v1.GenesisAccount.verify|verify} messages.
                 * @param message GenesisAccount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.evm.v1.IGenesisAccount, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GenesisAccount message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GenesisAccount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.evm.v1.GenesisAccount;

                /**
                 * Decodes a GenesisAccount message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GenesisAccount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.evm.v1.GenesisAccount;

                /**
                 * Verifies a GenesisAccount message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GenesisAccount message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GenesisAccount
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.evm.v1.GenesisAccount;

                /**
                 * Creates a plain object from a GenesisAccount message. Also converts values to other types if specified.
                 * @param message GenesisAccount
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.evm.v1.GenesisAccount, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GenesisAccount to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }

    /** Namespace feemarket. */
    namespace feemarket {

        /** Namespace v1. */
        namespace v1 {

            /** Represents a Msg */
            class Msg extends $protobuf.rpc.Service {

                /**
                 * Constructs a new Msg service.
                 * @param rpcImpl RPC implementation
                 * @param [requestDelimited=false] Whether requests are length-delimited
                 * @param [responseDelimited=false] Whether responses are length-delimited
                 */
                constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                /**
                 * Calls UpdateParams.
                 * @param request MsgUpdateParams message or plain object
                 * @param callback Node-style callback called with the error, if any, and MsgUpdateParamsResponse
                 */
                public updateParams(request: ethermint.feemarket.v1.IMsgUpdateParams, callback: ethermint.feemarket.v1.Msg.UpdateParamsCallback): void;

                /**
                 * Calls UpdateParams.
                 * @param request MsgUpdateParams message or plain object
                 * @returns Promise
                 */
                public updateParams(request: ethermint.feemarket.v1.IMsgUpdateParams): Promise<ethermint.feemarket.v1.MsgUpdateParamsResponse>;
            }

            namespace Msg {

                /**
                 * Callback as used by {@link ethermint.feemarket.v1.Msg#updateParams}.
                 * @param error Error, if any
                 * @param [response] MsgUpdateParamsResponse
                 */
                type UpdateParamsCallback = (error: (Error|null), response?: ethermint.feemarket.v1.MsgUpdateParamsResponse) => void;
            }

            /** Properties of a MsgUpdateParams. */
            interface IMsgUpdateParams {

                /** MsgUpdateParams authority */
                authority?: (string|null);

                /** MsgUpdateParams params */
                params?: (ethermint.feemarket.v1.IParams|null);
            }

            /** Represents a MsgUpdateParams. */
            class MsgUpdateParams implements IMsgUpdateParams {

                /**
                 * Constructs a new MsgUpdateParams.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IMsgUpdateParams);

                /** MsgUpdateParams authority. */
                public authority: string;

                /** MsgUpdateParams params. */
                public params?: (ethermint.feemarket.v1.IParams|null);

                /**
                 * Encodes the specified MsgUpdateParams message. Does not implicitly {@link ethermint.feemarket.v1.MsgUpdateParams.verify|verify} messages.
                 * @param message MsgUpdateParams message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IMsgUpdateParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MsgUpdateParams message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.MsgUpdateParams.verify|verify} messages.
                 * @param message MsgUpdateParams message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IMsgUpdateParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MsgUpdateParams message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MsgUpdateParams
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.MsgUpdateParams;

                /**
                 * Decodes a MsgUpdateParams message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MsgUpdateParams
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.MsgUpdateParams;

                /**
                 * Verifies a MsgUpdateParams message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MsgUpdateParams message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MsgUpdateParams
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.MsgUpdateParams;

                /**
                 * Creates a plain object from a MsgUpdateParams message. Also converts values to other types if specified.
                 * @param message MsgUpdateParams
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.MsgUpdateParams, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MsgUpdateParams to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a MsgUpdateParamsResponse. */
            interface IMsgUpdateParamsResponse {
            }

            /** Represents a MsgUpdateParamsResponse. */
            class MsgUpdateParamsResponse implements IMsgUpdateParamsResponse {

                /**
                 * Constructs a new MsgUpdateParamsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IMsgUpdateParamsResponse);

                /**
                 * Encodes the specified MsgUpdateParamsResponse message. Does not implicitly {@link ethermint.feemarket.v1.MsgUpdateParamsResponse.verify|verify} messages.
                 * @param message MsgUpdateParamsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IMsgUpdateParamsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified MsgUpdateParamsResponse message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.MsgUpdateParamsResponse.verify|verify} messages.
                 * @param message MsgUpdateParamsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IMsgUpdateParamsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a MsgUpdateParamsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns MsgUpdateParamsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.MsgUpdateParamsResponse;

                /**
                 * Decodes a MsgUpdateParamsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns MsgUpdateParamsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.MsgUpdateParamsResponse;

                /**
                 * Verifies a MsgUpdateParamsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a MsgUpdateParamsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns MsgUpdateParamsResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.MsgUpdateParamsResponse;

                /**
                 * Creates a plain object from a MsgUpdateParamsResponse message. Also converts values to other types if specified.
                 * @param message MsgUpdateParamsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.MsgUpdateParamsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this MsgUpdateParamsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a Params. */
            interface IParams {

                /** Params no_base_fee */
                no_base_fee?: (boolean|null);

                /** Params base_fee_change_denominator */
                base_fee_change_denominator?: (number|null);

                /** Params elasticity_multiplier */
                elasticity_multiplier?: (number|null);

                /** Params enable_height */
                enable_height?: (number|null);

                /** Params base_fee */
                base_fee?: (string|null);

                /** Params min_gas_price */
                min_gas_price?: (string|null);

                /** Params min_gas_multiplier */
                min_gas_multiplier?: (string|null);
            }

            /** Represents a Params. */
            class Params implements IParams {

                /**
                 * Constructs a new Params.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IParams);

                /** Params no_base_fee. */
                public no_base_fee: boolean;

                /** Params base_fee_change_denominator. */
                public base_fee_change_denominator: number;

                /** Params elasticity_multiplier. */
                public elasticity_multiplier: number;

                /** Params enable_height. */
                public enable_height: number;

                /** Params base_fee. */
                public base_fee: string;

                /** Params min_gas_price. */
                public min_gas_price: string;

                /** Params min_gas_multiplier. */
                public min_gas_multiplier: string;

                /**
                 * Encodes the specified Params message. Does not implicitly {@link ethermint.feemarket.v1.Params.verify|verify} messages.
                 * @param message Params message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Params message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.Params.verify|verify} messages.
                 * @param message Params message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Params message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Params
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.Params;

                /**
                 * Decodes a Params message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Params
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.Params;

                /**
                 * Verifies a Params message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Params message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Params
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.Params;

                /**
                 * Creates a plain object from a Params message. Also converts values to other types if specified.
                 * @param message Params
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.Params, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Params to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EventFeeMarket. */
            interface IEventFeeMarket {

                /** EventFeeMarket base_fee */
                base_fee?: (string|null);
            }

            /** Represents an EventFeeMarket. */
            class EventFeeMarket implements IEventFeeMarket {

                /**
                 * Constructs a new EventFeeMarket.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IEventFeeMarket);

                /** EventFeeMarket base_fee. */
                public base_fee: string;

                /**
                 * Encodes the specified EventFeeMarket message. Does not implicitly {@link ethermint.feemarket.v1.EventFeeMarket.verify|verify} messages.
                 * @param message EventFeeMarket message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IEventFeeMarket, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EventFeeMarket message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.EventFeeMarket.verify|verify} messages.
                 * @param message EventFeeMarket message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IEventFeeMarket, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EventFeeMarket message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EventFeeMarket
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.EventFeeMarket;

                /**
                 * Decodes an EventFeeMarket message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EventFeeMarket
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.EventFeeMarket;

                /**
                 * Verifies an EventFeeMarket message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EventFeeMarket message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EventFeeMarket
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.EventFeeMarket;

                /**
                 * Creates a plain object from an EventFeeMarket message. Also converts values to other types if specified.
                 * @param message EventFeeMarket
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.EventFeeMarket, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EventFeeMarket to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EventBlockGas. */
            interface IEventBlockGas {

                /** EventBlockGas height */
                height?: (string|null);

                /** EventBlockGas amount */
                amount?: (string|null);
            }

            /** Represents an EventBlockGas. */
            class EventBlockGas implements IEventBlockGas {

                /**
                 * Constructs a new EventBlockGas.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IEventBlockGas);

                /** EventBlockGas height. */
                public height: string;

                /** EventBlockGas amount. */
                public amount: string;

                /**
                 * Encodes the specified EventBlockGas message. Does not implicitly {@link ethermint.feemarket.v1.EventBlockGas.verify|verify} messages.
                 * @param message EventBlockGas message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IEventBlockGas, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EventBlockGas message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.EventBlockGas.verify|verify} messages.
                 * @param message EventBlockGas message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IEventBlockGas, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EventBlockGas message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EventBlockGas
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.EventBlockGas;

                /**
                 * Decodes an EventBlockGas message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EventBlockGas
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.EventBlockGas;

                /**
                 * Verifies an EventBlockGas message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EventBlockGas message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EventBlockGas
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.EventBlockGas;

                /**
                 * Creates a plain object from an EventBlockGas message. Also converts values to other types if specified.
                 * @param message EventBlockGas
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.EventBlockGas, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EventBlockGas to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Represents a Query */
            class Query extends $protobuf.rpc.Service {

                /**
                 * Constructs a new Query service.
                 * @param rpcImpl RPC implementation
                 * @param [requestDelimited=false] Whether requests are length-delimited
                 * @param [responseDelimited=false] Whether responses are length-delimited
                 */
                constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                /**
                 * Calls Params.
                 * @param request QueryParamsRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryParamsResponse
                 */
                public params(request: ethermint.feemarket.v1.IQueryParamsRequest, callback: ethermint.feemarket.v1.Query.ParamsCallback): void;

                /**
                 * Calls Params.
                 * @param request QueryParamsRequest message or plain object
                 * @returns Promise
                 */
                public params(request: ethermint.feemarket.v1.IQueryParamsRequest): Promise<ethermint.feemarket.v1.QueryParamsResponse>;

                /**
                 * Calls BaseFee.
                 * @param request QueryBaseFeeRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryBaseFeeResponse
                 */
                public baseFee(request: ethermint.feemarket.v1.IQueryBaseFeeRequest, callback: ethermint.feemarket.v1.Query.BaseFeeCallback): void;

                /**
                 * Calls BaseFee.
                 * @param request QueryBaseFeeRequest message or plain object
                 * @returns Promise
                 */
                public baseFee(request: ethermint.feemarket.v1.IQueryBaseFeeRequest): Promise<ethermint.feemarket.v1.QueryBaseFeeResponse>;

                /**
                 * Calls BlockGas.
                 * @param request QueryBlockGasRequest message or plain object
                 * @param callback Node-style callback called with the error, if any, and QueryBlockGasResponse
                 */
                public blockGas(request: ethermint.feemarket.v1.IQueryBlockGasRequest, callback: ethermint.feemarket.v1.Query.BlockGasCallback): void;

                /**
                 * Calls BlockGas.
                 * @param request QueryBlockGasRequest message or plain object
                 * @returns Promise
                 */
                public blockGas(request: ethermint.feemarket.v1.IQueryBlockGasRequest): Promise<ethermint.feemarket.v1.QueryBlockGasResponse>;
            }

            namespace Query {

                /**
                 * Callback as used by {@link ethermint.feemarket.v1.Query#params}.
                 * @param error Error, if any
                 * @param [response] QueryParamsResponse
                 */
                type ParamsCallback = (error: (Error|null), response?: ethermint.feemarket.v1.QueryParamsResponse) => void;

                /**
                 * Callback as used by {@link ethermint.feemarket.v1.Query#baseFee}.
                 * @param error Error, if any
                 * @param [response] QueryBaseFeeResponse
                 */
                type BaseFeeCallback = (error: (Error|null), response?: ethermint.feemarket.v1.QueryBaseFeeResponse) => void;

                /**
                 * Callback as used by {@link ethermint.feemarket.v1.Query#blockGas}.
                 * @param error Error, if any
                 * @param [response] QueryBlockGasResponse
                 */
                type BlockGasCallback = (error: (Error|null), response?: ethermint.feemarket.v1.QueryBlockGasResponse) => void;
            }

            /** Properties of a QueryParamsRequest. */
            interface IQueryParamsRequest {
            }

            /** Represents a QueryParamsRequest. */
            class QueryParamsRequest implements IQueryParamsRequest {

                /**
                 * Constructs a new QueryParamsRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IQueryParamsRequest);

                /**
                 * Encodes the specified QueryParamsRequest message. Does not implicitly {@link ethermint.feemarket.v1.QueryParamsRequest.verify|verify} messages.
                 * @param message QueryParamsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IQueryParamsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryParamsRequest message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.QueryParamsRequest.verify|verify} messages.
                 * @param message QueryParamsRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IQueryParamsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryParamsRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryParamsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.QueryParamsRequest;

                /**
                 * Decodes a QueryParamsRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryParamsRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.QueryParamsRequest;

                /**
                 * Verifies a QueryParamsRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryParamsRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryParamsRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.QueryParamsRequest;

                /**
                 * Creates a plain object from a QueryParamsRequest message. Also converts values to other types if specified.
                 * @param message QueryParamsRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.QueryParamsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryParamsRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryParamsResponse. */
            interface IQueryParamsResponse {

                /** QueryParamsResponse params */
                params?: (ethermint.feemarket.v1.IParams|null);
            }

            /** Represents a QueryParamsResponse. */
            class QueryParamsResponse implements IQueryParamsResponse {

                /**
                 * Constructs a new QueryParamsResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IQueryParamsResponse);

                /** QueryParamsResponse params. */
                public params?: (ethermint.feemarket.v1.IParams|null);

                /**
                 * Encodes the specified QueryParamsResponse message. Does not implicitly {@link ethermint.feemarket.v1.QueryParamsResponse.verify|verify} messages.
                 * @param message QueryParamsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IQueryParamsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryParamsResponse message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.QueryParamsResponse.verify|verify} messages.
                 * @param message QueryParamsResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IQueryParamsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryParamsResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryParamsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.QueryParamsResponse;

                /**
                 * Decodes a QueryParamsResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryParamsResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.QueryParamsResponse;

                /**
                 * Verifies a QueryParamsResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryParamsResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryParamsResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.QueryParamsResponse;

                /**
                 * Creates a plain object from a QueryParamsResponse message. Also converts values to other types if specified.
                 * @param message QueryParamsResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.QueryParamsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryParamsResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryBaseFeeRequest. */
            interface IQueryBaseFeeRequest {
            }

            /** Represents a QueryBaseFeeRequest. */
            class QueryBaseFeeRequest implements IQueryBaseFeeRequest {

                /**
                 * Constructs a new QueryBaseFeeRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IQueryBaseFeeRequest);

                /**
                 * Encodes the specified QueryBaseFeeRequest message. Does not implicitly {@link ethermint.feemarket.v1.QueryBaseFeeRequest.verify|verify} messages.
                 * @param message QueryBaseFeeRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IQueryBaseFeeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryBaseFeeRequest message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.QueryBaseFeeRequest.verify|verify} messages.
                 * @param message QueryBaseFeeRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IQueryBaseFeeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryBaseFeeRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryBaseFeeRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.QueryBaseFeeRequest;

                /**
                 * Decodes a QueryBaseFeeRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryBaseFeeRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.QueryBaseFeeRequest;

                /**
                 * Verifies a QueryBaseFeeRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryBaseFeeRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryBaseFeeRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.QueryBaseFeeRequest;

                /**
                 * Creates a plain object from a QueryBaseFeeRequest message. Also converts values to other types if specified.
                 * @param message QueryBaseFeeRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.QueryBaseFeeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryBaseFeeRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryBaseFeeResponse. */
            interface IQueryBaseFeeResponse {

                /** QueryBaseFeeResponse base_fee */
                base_fee?: (string|null);
            }

            /** Represents a QueryBaseFeeResponse. */
            class QueryBaseFeeResponse implements IQueryBaseFeeResponse {

                /**
                 * Constructs a new QueryBaseFeeResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IQueryBaseFeeResponse);

                /** QueryBaseFeeResponse base_fee. */
                public base_fee: string;

                /**
                 * Encodes the specified QueryBaseFeeResponse message. Does not implicitly {@link ethermint.feemarket.v1.QueryBaseFeeResponse.verify|verify} messages.
                 * @param message QueryBaseFeeResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IQueryBaseFeeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryBaseFeeResponse message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.QueryBaseFeeResponse.verify|verify} messages.
                 * @param message QueryBaseFeeResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IQueryBaseFeeResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryBaseFeeResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryBaseFeeResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.QueryBaseFeeResponse;

                /**
                 * Decodes a QueryBaseFeeResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryBaseFeeResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.QueryBaseFeeResponse;

                /**
                 * Verifies a QueryBaseFeeResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryBaseFeeResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryBaseFeeResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.QueryBaseFeeResponse;

                /**
                 * Creates a plain object from a QueryBaseFeeResponse message. Also converts values to other types if specified.
                 * @param message QueryBaseFeeResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.QueryBaseFeeResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryBaseFeeResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryBlockGasRequest. */
            interface IQueryBlockGasRequest {
            }

            /** Represents a QueryBlockGasRequest. */
            class QueryBlockGasRequest implements IQueryBlockGasRequest {

                /**
                 * Constructs a new QueryBlockGasRequest.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IQueryBlockGasRequest);

                /**
                 * Encodes the specified QueryBlockGasRequest message. Does not implicitly {@link ethermint.feemarket.v1.QueryBlockGasRequest.verify|verify} messages.
                 * @param message QueryBlockGasRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IQueryBlockGasRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryBlockGasRequest message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.QueryBlockGasRequest.verify|verify} messages.
                 * @param message QueryBlockGasRequest message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IQueryBlockGasRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryBlockGasRequest message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryBlockGasRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.QueryBlockGasRequest;

                /**
                 * Decodes a QueryBlockGasRequest message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryBlockGasRequest
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.QueryBlockGasRequest;

                /**
                 * Verifies a QueryBlockGasRequest message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryBlockGasRequest message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryBlockGasRequest
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.QueryBlockGasRequest;

                /**
                 * Creates a plain object from a QueryBlockGasRequest message. Also converts values to other types if specified.
                 * @param message QueryBlockGasRequest
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.QueryBlockGasRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryBlockGasRequest to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a QueryBlockGasResponse. */
            interface IQueryBlockGasResponse {

                /** QueryBlockGasResponse gas */
                gas?: (number|null);
            }

            /** Represents a QueryBlockGasResponse. */
            class QueryBlockGasResponse implements IQueryBlockGasResponse {

                /**
                 * Constructs a new QueryBlockGasResponse.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IQueryBlockGasResponse);

                /** QueryBlockGasResponse gas. */
                public gas: number;

                /**
                 * Encodes the specified QueryBlockGasResponse message. Does not implicitly {@link ethermint.feemarket.v1.QueryBlockGasResponse.verify|verify} messages.
                 * @param message QueryBlockGasResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IQueryBlockGasResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified QueryBlockGasResponse message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.QueryBlockGasResponse.verify|verify} messages.
                 * @param message QueryBlockGasResponse message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IQueryBlockGasResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a QueryBlockGasResponse message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns QueryBlockGasResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.QueryBlockGasResponse;

                /**
                 * Decodes a QueryBlockGasResponse message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns QueryBlockGasResponse
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.QueryBlockGasResponse;

                /**
                 * Verifies a QueryBlockGasResponse message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a QueryBlockGasResponse message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns QueryBlockGasResponse
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.QueryBlockGasResponse;

                /**
                 * Creates a plain object from a QueryBlockGasResponse message. Also converts values to other types if specified.
                 * @param message QueryBlockGasResponse
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.QueryBlockGasResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this QueryBlockGasResponse to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a GenesisState. */
            interface IGenesisState {

                /** GenesisState params */
                params?: (ethermint.feemarket.v1.IParams|null);

                /** GenesisState block_gas */
                block_gas?: (number|null);
            }

            /** Represents a GenesisState. */
            class GenesisState implements IGenesisState {

                /**
                 * Constructs a new GenesisState.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.feemarket.v1.IGenesisState);

                /** GenesisState params. */
                public params?: (ethermint.feemarket.v1.IParams|null);

                /** GenesisState block_gas. */
                public block_gas: number;

                /**
                 * Encodes the specified GenesisState message. Does not implicitly {@link ethermint.feemarket.v1.GenesisState.verify|verify} messages.
                 * @param message GenesisState message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.feemarket.v1.IGenesisState, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GenesisState message, length delimited. Does not implicitly {@link ethermint.feemarket.v1.GenesisState.verify|verify} messages.
                 * @param message GenesisState message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.feemarket.v1.IGenesisState, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GenesisState message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GenesisState
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.feemarket.v1.GenesisState;

                /**
                 * Decodes a GenesisState message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GenesisState
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.feemarket.v1.GenesisState;

                /**
                 * Verifies a GenesisState message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a GenesisState message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns GenesisState
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.feemarket.v1.GenesisState;

                /**
                 * Creates a plain object from a GenesisState message. Also converts values to other types if specified.
                 * @param message GenesisState
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.feemarket.v1.GenesisState, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this GenesisState to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }

    /** Namespace types. */
    namespace types {

        /** Namespace v1. */
        namespace v1 {

            /** Properties of an ExtensionOptionDynamicFeeTx. */
            interface IExtensionOptionDynamicFeeTx {

                /** ExtensionOptionDynamicFeeTx max_priority_price */
                max_priority_price?: (string|null);
            }

            /** Represents an ExtensionOptionDynamicFeeTx. */
            class ExtensionOptionDynamicFeeTx implements IExtensionOptionDynamicFeeTx {

                /**
                 * Constructs a new ExtensionOptionDynamicFeeTx.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.types.v1.IExtensionOptionDynamicFeeTx);

                /** ExtensionOptionDynamicFeeTx max_priority_price. */
                public max_priority_price: string;

                /**
                 * Encodes the specified ExtensionOptionDynamicFeeTx message. Does not implicitly {@link ethermint.types.v1.ExtensionOptionDynamicFeeTx.verify|verify} messages.
                 * @param message ExtensionOptionDynamicFeeTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.types.v1.IExtensionOptionDynamicFeeTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ExtensionOptionDynamicFeeTx message, length delimited. Does not implicitly {@link ethermint.types.v1.ExtensionOptionDynamicFeeTx.verify|verify} messages.
                 * @param message ExtensionOptionDynamicFeeTx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.types.v1.IExtensionOptionDynamicFeeTx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ExtensionOptionDynamicFeeTx message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ExtensionOptionDynamicFeeTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.types.v1.ExtensionOptionDynamicFeeTx;

                /**
                 * Decodes an ExtensionOptionDynamicFeeTx message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ExtensionOptionDynamicFeeTx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.types.v1.ExtensionOptionDynamicFeeTx;

                /**
                 * Verifies an ExtensionOptionDynamicFeeTx message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ExtensionOptionDynamicFeeTx message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ExtensionOptionDynamicFeeTx
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.types.v1.ExtensionOptionDynamicFeeTx;

                /**
                 * Creates a plain object from an ExtensionOptionDynamicFeeTx message. Also converts values to other types if specified.
                 * @param message ExtensionOptionDynamicFeeTx
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.types.v1.ExtensionOptionDynamicFeeTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ExtensionOptionDynamicFeeTx to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an EthAccount. */
            interface IEthAccount {

                /** EthAccount base_account */
                base_account?: (cosmos.auth.v1beta1.IBaseAccount|null);

                /** EthAccount code_hash */
                code_hash?: (string|null);
            }

            /** Represents an EthAccount. */
            class EthAccount implements IEthAccount {

                /**
                 * Constructs a new EthAccount.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.types.v1.IEthAccount);

                /** EthAccount base_account. */
                public base_account?: (cosmos.auth.v1beta1.IBaseAccount|null);

                /** EthAccount code_hash. */
                public code_hash: string;

                /**
                 * Encodes the specified EthAccount message. Does not implicitly {@link ethermint.types.v1.EthAccount.verify|verify} messages.
                 * @param message EthAccount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.types.v1.IEthAccount, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EthAccount message, length delimited. Does not implicitly {@link ethermint.types.v1.EthAccount.verify|verify} messages.
                 * @param message EthAccount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.types.v1.IEthAccount, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EthAccount message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EthAccount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.types.v1.EthAccount;

                /**
                 * Decodes an EthAccount message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EthAccount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.types.v1.EthAccount;

                /**
                 * Verifies an EthAccount message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EthAccount message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EthAccount
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.types.v1.EthAccount;

                /**
                 * Creates a plain object from an EthAccount message. Also converts values to other types if specified.
                 * @param message EthAccount
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.types.v1.EthAccount, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EthAccount to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of an ExtensionOptionsWeb3Tx. */
            interface IExtensionOptionsWeb3Tx {

                /** ExtensionOptionsWeb3Tx typed_data_chain_id */
                typed_data_chain_id?: (number|null);

                /** ExtensionOptionsWeb3Tx fee_payer */
                fee_payer?: (string|null);

                /** ExtensionOptionsWeb3Tx fee_payer_sig */
                fee_payer_sig?: (Uint8Array|null);
            }

            /** Represents an ExtensionOptionsWeb3Tx. */
            class ExtensionOptionsWeb3Tx implements IExtensionOptionsWeb3Tx {

                /**
                 * Constructs a new ExtensionOptionsWeb3Tx.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.types.v1.IExtensionOptionsWeb3Tx);

                /** ExtensionOptionsWeb3Tx typed_data_chain_id. */
                public typed_data_chain_id: number;

                /** ExtensionOptionsWeb3Tx fee_payer. */
                public fee_payer: string;

                /** ExtensionOptionsWeb3Tx fee_payer_sig. */
                public fee_payer_sig: Uint8Array;

                /**
                 * Encodes the specified ExtensionOptionsWeb3Tx message. Does not implicitly {@link ethermint.types.v1.ExtensionOptionsWeb3Tx.verify|verify} messages.
                 * @param message ExtensionOptionsWeb3Tx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.types.v1.IExtensionOptionsWeb3Tx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ExtensionOptionsWeb3Tx message, length delimited. Does not implicitly {@link ethermint.types.v1.ExtensionOptionsWeb3Tx.verify|verify} messages.
                 * @param message ExtensionOptionsWeb3Tx message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.types.v1.IExtensionOptionsWeb3Tx, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ExtensionOptionsWeb3Tx message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ExtensionOptionsWeb3Tx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.types.v1.ExtensionOptionsWeb3Tx;

                /**
                 * Decodes an ExtensionOptionsWeb3Tx message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ExtensionOptionsWeb3Tx
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.types.v1.ExtensionOptionsWeb3Tx;

                /**
                 * Verifies an ExtensionOptionsWeb3Tx message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ExtensionOptionsWeb3Tx message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ExtensionOptionsWeb3Tx
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.types.v1.ExtensionOptionsWeb3Tx;

                /**
                 * Creates a plain object from an ExtensionOptionsWeb3Tx message. Also converts values to other types if specified.
                 * @param message ExtensionOptionsWeb3Tx
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.types.v1.ExtensionOptionsWeb3Tx, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ExtensionOptionsWeb3Tx to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a TxResult. */
            interface ITxResult {

                /** TxResult height */
                height?: (number|null);

                /** TxResult tx_index */
                tx_index?: (number|null);

                /** TxResult msg_index */
                msg_index?: (number|null);

                /** TxResult eth_tx_index */
                eth_tx_index?: (number|null);

                /** TxResult failed */
                failed?: (boolean|null);

                /** TxResult gas_used */
                gas_used?: (number|null);

                /** TxResult cumulative_gas_used */
                cumulative_gas_used?: (number|null);
            }

            /** Represents a TxResult. */
            class TxResult implements ITxResult {

                /**
                 * Constructs a new TxResult.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: ethermint.types.v1.ITxResult);

                /** TxResult height. */
                public height: number;

                /** TxResult tx_index. */
                public tx_index: number;

                /** TxResult msg_index. */
                public msg_index: number;

                /** TxResult eth_tx_index. */
                public eth_tx_index: number;

                /** TxResult failed. */
                public failed: boolean;

                /** TxResult gas_used. */
                public gas_used: number;

                /** TxResult cumulative_gas_used. */
                public cumulative_gas_used: number;

                /**
                 * Encodes the specified TxResult message. Does not implicitly {@link ethermint.types.v1.TxResult.verify|verify} messages.
                 * @param message TxResult message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: ethermint.types.v1.ITxResult, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified TxResult message, length delimited. Does not implicitly {@link ethermint.types.v1.TxResult.verify|verify} messages.
                 * @param message TxResult message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: ethermint.types.v1.ITxResult, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a TxResult message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns TxResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): ethermint.types.v1.TxResult;

                /**
                 * Decodes a TxResult message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns TxResult
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): ethermint.types.v1.TxResult;

                /**
                 * Verifies a TxResult message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a TxResult message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns TxResult
                 */
                public static fromObject(object: { [k: string]: any }): ethermint.types.v1.TxResult;

                /**
                 * Creates a plain object from a TxResult message. Also converts values to other types if specified.
                 * @param message TxResult
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: ethermint.types.v1.TxResult, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this TxResult to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }
}

/** Namespace cosmos. */
export namespace cosmos {

    /** Namespace msg. */
    namespace msg {
    }

    /** Namespace base. */
    namespace base {

        /** Namespace query. */
        namespace query {

            /** Namespace v1beta1. */
            namespace v1beta1 {

                /** Properties of a PageRequest. */
                interface IPageRequest {

                    /** PageRequest key */
                    key?: (Uint8Array|null);

                    /** PageRequest offset */
                    offset?: (number|null);

                    /** PageRequest limit */
                    limit?: (number|null);

                    /** PageRequest count_total */
                    count_total?: (boolean|null);

                    /** PageRequest reverse */
                    reverse?: (boolean|null);
                }

                /** Represents a PageRequest. */
                class PageRequest implements IPageRequest {

                    /**
                     * Constructs a new PageRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: cosmos.base.query.v1beta1.IPageRequest);

                    /** PageRequest key. */
                    public key: Uint8Array;

                    /** PageRequest offset. */
                    public offset: number;

                    /** PageRequest limit. */
                    public limit: number;

                    /** PageRequest count_total. */
                    public count_total: boolean;

                    /** PageRequest reverse. */
                    public reverse: boolean;

                    /**
                     * Encodes the specified PageRequest message. Does not implicitly {@link cosmos.base.query.v1beta1.PageRequest.verify|verify} messages.
                     * @param message PageRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: cosmos.base.query.v1beta1.IPageRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified PageRequest message, length delimited. Does not implicitly {@link cosmos.base.query.v1beta1.PageRequest.verify|verify} messages.
                     * @param message PageRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: cosmos.base.query.v1beta1.IPageRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a PageRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns PageRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.base.query.v1beta1.PageRequest;

                    /**
                     * Decodes a PageRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns PageRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.base.query.v1beta1.PageRequest;

                    /**
                     * Verifies a PageRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a PageRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns PageRequest
                     */
                    public static fromObject(object: { [k: string]: any }): cosmos.base.query.v1beta1.PageRequest;

                    /**
                     * Creates a plain object from a PageRequest message. Also converts values to other types if specified.
                     * @param message PageRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: cosmos.base.query.v1beta1.PageRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this PageRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a PageResponse. */
                interface IPageResponse {

                    /** PageResponse next_key */
                    next_key?: (Uint8Array|null);

                    /** PageResponse total */
                    total?: (number|null);
                }

                /** Represents a PageResponse. */
                class PageResponse implements IPageResponse {

                    /**
                     * Constructs a new PageResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: cosmos.base.query.v1beta1.IPageResponse);

                    /** PageResponse next_key. */
                    public next_key: Uint8Array;

                    /** PageResponse total. */
                    public total: number;

                    /**
                     * Encodes the specified PageResponse message. Does not implicitly {@link cosmos.base.query.v1beta1.PageResponse.verify|verify} messages.
                     * @param message PageResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: cosmos.base.query.v1beta1.IPageResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified PageResponse message, length delimited. Does not implicitly {@link cosmos.base.query.v1beta1.PageResponse.verify|verify} messages.
                     * @param message PageResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: cosmos.base.query.v1beta1.IPageResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a PageResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns PageResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.base.query.v1beta1.PageResponse;

                    /**
                     * Decodes a PageResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns PageResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.base.query.v1beta1.PageResponse;

                    /**
                     * Verifies a PageResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a PageResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns PageResponse
                     */
                    public static fromObject(object: { [k: string]: any }): cosmos.base.query.v1beta1.PageResponse;

                    /**
                     * Creates a plain object from a PageResponse message. Also converts values to other types if specified.
                     * @param message PageResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: cosmos.base.query.v1beta1.PageResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this PageResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }
        }
    }

    /** Namespace auth. */
    namespace auth {

        /** Namespace v1beta1. */
        namespace v1beta1 {

            /** Properties of a BaseAccount. */
            interface IBaseAccount {

                /** BaseAccount address */
                address?: (string|null);

                /** BaseAccount pub_key */
                pub_key?: (google.protobuf.IAny|null);

                /** BaseAccount account_number */
                account_number?: (number|null);

                /** BaseAccount sequence */
                sequence?: (number|null);
            }

            /** Represents a BaseAccount. */
            class BaseAccount implements IBaseAccount {

                /**
                 * Constructs a new BaseAccount.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: cosmos.auth.v1beta1.IBaseAccount);

                /** BaseAccount address. */
                public address: string;

                /** BaseAccount pub_key. */
                public pub_key?: (google.protobuf.IAny|null);

                /** BaseAccount account_number. */
                public account_number: number;

                /** BaseAccount sequence. */
                public sequence: number;

                /**
                 * Encodes the specified BaseAccount message. Does not implicitly {@link cosmos.auth.v1beta1.BaseAccount.verify|verify} messages.
                 * @param message BaseAccount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: cosmos.auth.v1beta1.IBaseAccount, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified BaseAccount message, length delimited. Does not implicitly {@link cosmos.auth.v1beta1.BaseAccount.verify|verify} messages.
                 * @param message BaseAccount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: cosmos.auth.v1beta1.IBaseAccount, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a BaseAccount message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns BaseAccount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.auth.v1beta1.BaseAccount;

                /**
                 * Decodes a BaseAccount message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns BaseAccount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.auth.v1beta1.BaseAccount;

                /**
                 * Verifies a BaseAccount message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a BaseAccount message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns BaseAccount
                 */
                public static fromObject(object: { [k: string]: any }): cosmos.auth.v1beta1.BaseAccount;

                /**
                 * Creates a plain object from a BaseAccount message. Also converts values to other types if specified.
                 * @param message BaseAccount
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: cosmos.auth.v1beta1.BaseAccount, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this BaseAccount to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ModuleAccount. */
            interface IModuleAccount {

                /** ModuleAccount base_account */
                base_account?: (cosmos.auth.v1beta1.IBaseAccount|null);

                /** ModuleAccount name */
                name?: (string|null);

                /** ModuleAccount permissions */
                permissions?: (string[]|null);
            }

            /** Represents a ModuleAccount. */
            class ModuleAccount implements IModuleAccount {

                /**
                 * Constructs a new ModuleAccount.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: cosmos.auth.v1beta1.IModuleAccount);

                /** ModuleAccount base_account. */
                public base_account?: (cosmos.auth.v1beta1.IBaseAccount|null);

                /** ModuleAccount name. */
                public name: string;

                /** ModuleAccount permissions. */
                public permissions: string[];

                /**
                 * Encodes the specified ModuleAccount message. Does not implicitly {@link cosmos.auth.v1beta1.ModuleAccount.verify|verify} messages.
                 * @param message ModuleAccount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: cosmos.auth.v1beta1.IModuleAccount, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ModuleAccount message, length delimited. Does not implicitly {@link cosmos.auth.v1beta1.ModuleAccount.verify|verify} messages.
                 * @param message ModuleAccount message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: cosmos.auth.v1beta1.IModuleAccount, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ModuleAccount message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ModuleAccount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.auth.v1beta1.ModuleAccount;

                /**
                 * Decodes a ModuleAccount message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ModuleAccount
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.auth.v1beta1.ModuleAccount;

                /**
                 * Verifies a ModuleAccount message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ModuleAccount message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ModuleAccount
                 */
                public static fromObject(object: { [k: string]: any }): cosmos.auth.v1beta1.ModuleAccount;

                /**
                 * Creates a plain object from a ModuleAccount message. Also converts values to other types if specified.
                 * @param message ModuleAccount
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: cosmos.auth.v1beta1.ModuleAccount, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ModuleAccount to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a Params. */
            interface IParams {

                /** Params max_memo_characters */
                max_memo_characters?: (number|null);

                /** Params tx_sig_limit */
                tx_sig_limit?: (number|null);

                /** Params tx_size_cost_per_byte */
                tx_size_cost_per_byte?: (number|null);

                /** Params sig_verify_cost_ed25519 */
                sig_verify_cost_ed25519?: (number|null);

                /** Params sig_verify_cost_secp256k1 */
                sig_verify_cost_secp256k1?: (number|null);
            }

            /** Represents a Params. */
            class Params implements IParams {

                /**
                 * Constructs a new Params.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: cosmos.auth.v1beta1.IParams);

                /** Params max_memo_characters. */
                public max_memo_characters: number;

                /** Params tx_sig_limit. */
                public tx_sig_limit: number;

                /** Params tx_size_cost_per_byte. */
                public tx_size_cost_per_byte: number;

                /** Params sig_verify_cost_ed25519. */
                public sig_verify_cost_ed25519: number;

                /** Params sig_verify_cost_secp256k1. */
                public sig_verify_cost_secp256k1: number;

                /**
                 * Encodes the specified Params message. Does not implicitly {@link cosmos.auth.v1beta1.Params.verify|verify} messages.
                 * @param message Params message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: cosmos.auth.v1beta1.IParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Params message, length delimited. Does not implicitly {@link cosmos.auth.v1beta1.Params.verify|verify} messages.
                 * @param message Params message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: cosmos.auth.v1beta1.IParams, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Params message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Params
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.auth.v1beta1.Params;

                /**
                 * Decodes a Params message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Params
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.auth.v1beta1.Params;

                /**
                 * Verifies a Params message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Params message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Params
                 */
                public static fromObject(object: { [k: string]: any }): cosmos.auth.v1beta1.Params;

                /**
                 * Creates a plain object from a Params message. Also converts values to other types if specified.
                 * @param message Params
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: cosmos.auth.v1beta1.Params, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Params to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a FileDescriptorSet. */
        interface IFileDescriptorSet {

            /** FileDescriptorSet file */
            file?: (google.protobuf.IFileDescriptorProto[]|null);
        }

        /** Represents a FileDescriptorSet. */
        class FileDescriptorSet implements IFileDescriptorSet {

            /**
             * Constructs a new FileDescriptorSet.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileDescriptorSet);

            /** FileDescriptorSet file. */
            public file: google.protobuf.IFileDescriptorProto[];

            /**
             * Encodes the specified FileDescriptorSet message. Does not implicitly {@link google.protobuf.FileDescriptorSet.verify|verify} messages.
             * @param message FileDescriptorSet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileDescriptorSet message, length delimited. Does not implicitly {@link google.protobuf.FileDescriptorSet.verify|verify} messages.
             * @param message FileDescriptorSet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileDescriptorSet message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileDescriptorSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorSet;

            /**
             * Decodes a FileDescriptorSet message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileDescriptorSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorSet;

            /**
             * Verifies a FileDescriptorSet message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileDescriptorSet message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileDescriptorSet
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorSet;

            /**
             * Creates a plain object from a FileDescriptorSet message. Also converts values to other types if specified.
             * @param message FileDescriptorSet
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileDescriptorSet, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileDescriptorSet to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FileDescriptorProto. */
        interface IFileDescriptorProto {

            /** FileDescriptorProto name */
            name?: (string|null);

            /** FileDescriptorProto package */
            "package"?: (string|null);

            /** FileDescriptorProto dependency */
            dependency?: (string[]|null);

            /** FileDescriptorProto public_dependency */
            public_dependency?: (number[]|null);

            /** FileDescriptorProto weak_dependency */
            weak_dependency?: (number[]|null);

            /** FileDescriptorProto message_type */
            message_type?: (google.protobuf.IDescriptorProto[]|null);

            /** FileDescriptorProto enum_type */
            enum_type?: (google.protobuf.IEnumDescriptorProto[]|null);

            /** FileDescriptorProto service */
            service?: (google.protobuf.IServiceDescriptorProto[]|null);

            /** FileDescriptorProto extension */
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** FileDescriptorProto options */
            options?: (google.protobuf.IFileOptions|null);

            /** FileDescriptorProto source_code_info */
            source_code_info?: (google.protobuf.ISourceCodeInfo|null);

            /** FileDescriptorProto syntax */
            syntax?: (string|null);
        }

        /** Represents a FileDescriptorProto. */
        class FileDescriptorProto implements IFileDescriptorProto {

            /**
             * Constructs a new FileDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileDescriptorProto);

            /** FileDescriptorProto name. */
            public name: string;

            /** FileDescriptorProto package. */
            public package: string;

            /** FileDescriptorProto dependency. */
            public dependency: string[];

            /** FileDescriptorProto public_dependency. */
            public public_dependency: number[];

            /** FileDescriptorProto weak_dependency. */
            public weak_dependency: number[];

            /** FileDescriptorProto message_type. */
            public message_type: google.protobuf.IDescriptorProto[];

            /** FileDescriptorProto enum_type. */
            public enum_type: google.protobuf.IEnumDescriptorProto[];

            /** FileDescriptorProto service. */
            public service: google.protobuf.IServiceDescriptorProto[];

            /** FileDescriptorProto extension. */
            public extension: google.protobuf.IFieldDescriptorProto[];

            /** FileDescriptorProto options. */
            public options?: (google.protobuf.IFileOptions|null);

            /** FileDescriptorProto source_code_info. */
            public source_code_info?: (google.protobuf.ISourceCodeInfo|null);

            /** FileDescriptorProto syntax. */
            public syntax: string;

            /**
             * Encodes the specified FileDescriptorProto message. Does not implicitly {@link google.protobuf.FileDescriptorProto.verify|verify} messages.
             * @param message FileDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.FileDescriptorProto.verify|verify} messages.
             * @param message FileDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorProto;

            /**
             * Decodes a FileDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorProto;

            /**
             * Verifies a FileDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorProto;

            /**
             * Creates a plain object from a FileDescriptorProto message. Also converts values to other types if specified.
             * @param message FileDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DescriptorProto. */
        interface IDescriptorProto {

            /** DescriptorProto name */
            name?: (string|null);

            /** DescriptorProto field */
            field?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** DescriptorProto extension */
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** DescriptorProto nested_type */
            nested_type?: (google.protobuf.IDescriptorProto[]|null);

            /** DescriptorProto enum_type */
            enum_type?: (google.protobuf.IEnumDescriptorProto[]|null);

            /** DescriptorProto extension_range */
            extension_range?: (google.protobuf.DescriptorProto.IExtensionRange[]|null);

            /** DescriptorProto oneof_decl */
            oneof_decl?: (google.protobuf.IOneofDescriptorProto[]|null);

            /** DescriptorProto options */
            options?: (google.protobuf.IMessageOptions|null);

            /** DescriptorProto reserved_range */
            reserved_range?: (google.protobuf.DescriptorProto.IReservedRange[]|null);

            /** DescriptorProto reserved_name */
            reserved_name?: (string[]|null);
        }

        /** Represents a DescriptorProto. */
        class DescriptorProto implements IDescriptorProto {

            /**
             * Constructs a new DescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IDescriptorProto);

            /** DescriptorProto name. */
            public name: string;

            /** DescriptorProto field. */
            public field: google.protobuf.IFieldDescriptorProto[];

            /** DescriptorProto extension. */
            public extension: google.protobuf.IFieldDescriptorProto[];

            /** DescriptorProto nested_type. */
            public nested_type: google.protobuf.IDescriptorProto[];

            /** DescriptorProto enum_type. */
            public enum_type: google.protobuf.IEnumDescriptorProto[];

            /** DescriptorProto extension_range. */
            public extension_range: google.protobuf.DescriptorProto.IExtensionRange[];

            /** DescriptorProto oneof_decl. */
            public oneof_decl: google.protobuf.IOneofDescriptorProto[];

            /** DescriptorProto options. */
            public options?: (google.protobuf.IMessageOptions|null);

            /** DescriptorProto reserved_range. */
            public reserved_range: google.protobuf.DescriptorProto.IReservedRange[];

            /** DescriptorProto reserved_name. */
            public reserved_name: string[];

            /**
             * Encodes the specified DescriptorProto message. Does not implicitly {@link google.protobuf.DescriptorProto.verify|verify} messages.
             * @param message DescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.verify|verify} messages.
             * @param message DescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto;

            /**
             * Decodes a DescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto;

            /**
             * Verifies a DescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto;

            /**
             * Creates a plain object from a DescriptorProto message. Also converts values to other types if specified.
             * @param message DescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.DescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace DescriptorProto {

            /** Properties of an ExtensionRange. */
            interface IExtensionRange {

                /** ExtensionRange start */
                start?: (number|null);

                /** ExtensionRange end */
                end?: (number|null);
            }

            /** Represents an ExtensionRange. */
            class ExtensionRange implements IExtensionRange {

                /**
                 * Constructs a new ExtensionRange.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.DescriptorProto.IExtensionRange);

                /** ExtensionRange start. */
                public start: number;

                /** ExtensionRange end. */
                public end: number;

                /**
                 * Encodes the specified ExtensionRange message. Does not implicitly {@link google.protobuf.DescriptorProto.ExtensionRange.verify|verify} messages.
                 * @param message ExtensionRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ExtensionRange message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.ExtensionRange.verify|verify} messages.
                 * @param message ExtensionRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ExtensionRange message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ExtensionRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Decodes an ExtensionRange message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ExtensionRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Verifies an ExtensionRange message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ExtensionRange message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ExtensionRange
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Creates a plain object from an ExtensionRange message. Also converts values to other types if specified.
                 * @param message ExtensionRange
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.DescriptorProto.ExtensionRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ExtensionRange to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ReservedRange. */
            interface IReservedRange {

                /** ReservedRange start */
                start?: (number|null);

                /** ReservedRange end */
                end?: (number|null);
            }

            /** Represents a ReservedRange. */
            class ReservedRange implements IReservedRange {

                /**
                 * Constructs a new ReservedRange.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.DescriptorProto.IReservedRange);

                /** ReservedRange start. */
                public start: number;

                /** ReservedRange end. */
                public end: number;

                /**
                 * Encodes the specified ReservedRange message. Does not implicitly {@link google.protobuf.DescriptorProto.ReservedRange.verify|verify} messages.
                 * @param message ReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ReservedRange message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.ReservedRange.verify|verify} messages.
                 * @param message ReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ReservedRange message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Decodes a ReservedRange message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Verifies a ReservedRange message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ReservedRange message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ReservedRange
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Creates a plain object from a ReservedRange message. Also converts values to other types if specified.
                 * @param message ReservedRange
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.DescriptorProto.ReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ReservedRange to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a FieldDescriptorProto. */
        interface IFieldDescriptorProto {

            /** FieldDescriptorProto name */
            name?: (string|null);

            /** FieldDescriptorProto number */
            number?: (number|null);

            /** FieldDescriptorProto label */
            label?: (google.protobuf.FieldDescriptorProto.Label|null);

            /** FieldDescriptorProto type */
            type?: (google.protobuf.FieldDescriptorProto.Type|null);

            /** FieldDescriptorProto type_name */
            type_name?: (string|null);

            /** FieldDescriptorProto extendee */
            extendee?: (string|null);

            /** FieldDescriptorProto default_value */
            default_value?: (string|null);

            /** FieldDescriptorProto oneof_index */
            oneof_index?: (number|null);

            /** FieldDescriptorProto json_name */
            json_name?: (string|null);

            /** FieldDescriptorProto options */
            options?: (google.protobuf.IFieldOptions|null);
        }

        /** Represents a FieldDescriptorProto. */
        class FieldDescriptorProto implements IFieldDescriptorProto {

            /**
             * Constructs a new FieldDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFieldDescriptorProto);

            /** FieldDescriptorProto name. */
            public name: string;

            /** FieldDescriptorProto number. */
            public number: number;

            /** FieldDescriptorProto label. */
            public label: google.protobuf.FieldDescriptorProto.Label;

            /** FieldDescriptorProto type. */
            public type: google.protobuf.FieldDescriptorProto.Type;

            /** FieldDescriptorProto type_name. */
            public type_name: string;

            /** FieldDescriptorProto extendee. */
            public extendee: string;

            /** FieldDescriptorProto default_value. */
            public default_value: string;

            /** FieldDescriptorProto oneof_index. */
            public oneof_index: number;

            /** FieldDescriptorProto json_name. */
            public json_name: string;

            /** FieldDescriptorProto options. */
            public options?: (google.protobuf.IFieldOptions|null);

            /**
             * Encodes the specified FieldDescriptorProto message. Does not implicitly {@link google.protobuf.FieldDescriptorProto.verify|verify} messages.
             * @param message FieldDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.FieldDescriptorProto.verify|verify} messages.
             * @param message FieldDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldDescriptorProto;

            /**
             * Decodes a FieldDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldDescriptorProto;

            /**
             * Verifies a FieldDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FieldDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FieldDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldDescriptorProto;

            /**
             * Creates a plain object from a FieldDescriptorProto message. Also converts values to other types if specified.
             * @param message FieldDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FieldDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FieldDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace FieldDescriptorProto {

            /** Type enum. */
            enum Type {
                TYPE_DOUBLE = 1,
                TYPE_FLOAT = 2,
                TYPE_INT64 = 3,
                TYPE_UINT64 = 4,
                TYPE_INT32 = 5,
                TYPE_FIXED64 = 6,
                TYPE_FIXED32 = 7,
                TYPE_BOOL = 8,
                TYPE_STRING = 9,
                TYPE_GROUP = 10,
                TYPE_MESSAGE = 11,
                TYPE_BYTES = 12,
                TYPE_UINT32 = 13,
                TYPE_ENUM = 14,
                TYPE_SFIXED32 = 15,
                TYPE_SFIXED64 = 16,
                TYPE_SINT32 = 17,
                TYPE_SINT64 = 18
            }

            /** Label enum. */
            enum Label {
                LABEL_OPTIONAL = 1,
                LABEL_REQUIRED = 2,
                LABEL_REPEATED = 3
            }
        }

        /** Properties of an OneofDescriptorProto. */
        interface IOneofDescriptorProto {

            /** OneofDescriptorProto name */
            name?: (string|null);

            /** OneofDescriptorProto options */
            options?: (google.protobuf.IOneofOptions|null);
        }

        /** Represents an OneofDescriptorProto. */
        class OneofDescriptorProto implements IOneofDescriptorProto {

            /**
             * Constructs a new OneofDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IOneofDescriptorProto);

            /** OneofDescriptorProto name. */
            public name: string;

            /** OneofDescriptorProto options. */
            public options?: (google.protobuf.IOneofOptions|null);

            /**
             * Encodes the specified OneofDescriptorProto message. Does not implicitly {@link google.protobuf.OneofDescriptorProto.verify|verify} messages.
             * @param message OneofDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.OneofDescriptorProto.verify|verify} messages.
             * @param message OneofDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofDescriptorProto;

            /**
             * Decodes an OneofDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofDescriptorProto;

            /**
             * Verifies an OneofDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofDescriptorProto;

            /**
             * Creates a plain object from an OneofDescriptorProto message. Also converts values to other types if specified.
             * @param message OneofDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.OneofDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an EnumDescriptorProto. */
        interface IEnumDescriptorProto {

            /** EnumDescriptorProto name */
            name?: (string|null);

            /** EnumDescriptorProto value */
            value?: (google.protobuf.IEnumValueDescriptorProto[]|null);

            /** EnumDescriptorProto options */
            options?: (google.protobuf.IEnumOptions|null);
        }

        /** Represents an EnumDescriptorProto. */
        class EnumDescriptorProto implements IEnumDescriptorProto {

            /**
             * Constructs a new EnumDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumDescriptorProto);

            /** EnumDescriptorProto name. */
            public name: string;

            /** EnumDescriptorProto value. */
            public value: google.protobuf.IEnumValueDescriptorProto[];

            /** EnumDescriptorProto options. */
            public options?: (google.protobuf.IEnumOptions|null);

            /**
             * Encodes the specified EnumDescriptorProto message. Does not implicitly {@link google.protobuf.EnumDescriptorProto.verify|verify} messages.
             * @param message EnumDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.EnumDescriptorProto.verify|verify} messages.
             * @param message EnumDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto;

            /**
             * Decodes an EnumDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto;

            /**
             * Verifies an EnumDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto;

            /**
             * Creates a plain object from an EnumDescriptorProto message. Also converts values to other types if specified.
             * @param message EnumDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an EnumValueDescriptorProto. */
        interface IEnumValueDescriptorProto {

            /** EnumValueDescriptorProto name */
            name?: (string|null);

            /** EnumValueDescriptorProto number */
            number?: (number|null);

            /** EnumValueDescriptorProto options */
            options?: (google.protobuf.IEnumValueOptions|null);
        }

        /** Represents an EnumValueDescriptorProto. */
        class EnumValueDescriptorProto implements IEnumValueDescriptorProto {

            /**
             * Constructs a new EnumValueDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumValueDescriptorProto);

            /** EnumValueDescriptorProto name. */
            public name: string;

            /** EnumValueDescriptorProto number. */
            public number: number;

            /** EnumValueDescriptorProto options. */
            public options?: (google.protobuf.IEnumValueOptions|null);

            /**
             * Encodes the specified EnumValueDescriptorProto message. Does not implicitly {@link google.protobuf.EnumValueDescriptorProto.verify|verify} messages.
             * @param message EnumValueDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumValueDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.EnumValueDescriptorProto.verify|verify} messages.
             * @param message EnumValueDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumValueDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumValueDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueDescriptorProto;

            /**
             * Decodes an EnumValueDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumValueDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueDescriptorProto;

            /**
             * Verifies an EnumValueDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumValueDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumValueDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueDescriptorProto;

            /**
             * Creates a plain object from an EnumValueDescriptorProto message. Also converts values to other types if specified.
             * @param message EnumValueDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumValueDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumValueDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ServiceDescriptorProto. */
        interface IServiceDescriptorProto {

            /** ServiceDescriptorProto name */
            name?: (string|null);

            /** ServiceDescriptorProto method */
            method?: (google.protobuf.IMethodDescriptorProto[]|null);

            /** ServiceDescriptorProto options */
            options?: (google.protobuf.IServiceOptions|null);
        }

        /** Represents a ServiceDescriptorProto. */
        class ServiceDescriptorProto implements IServiceDescriptorProto {

            /**
             * Constructs a new ServiceDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IServiceDescriptorProto);

            /** ServiceDescriptorProto name. */
            public name: string;

            /** ServiceDescriptorProto method. */
            public method: google.protobuf.IMethodDescriptorProto[];

            /** ServiceDescriptorProto options. */
            public options?: (google.protobuf.IServiceOptions|null);

            /**
             * Encodes the specified ServiceDescriptorProto message. Does not implicitly {@link google.protobuf.ServiceDescriptorProto.verify|verify} messages.
             * @param message ServiceDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServiceDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.ServiceDescriptorProto.verify|verify} messages.
             * @param message ServiceDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServiceDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServiceDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceDescriptorProto;

            /**
             * Decodes a ServiceDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServiceDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceDescriptorProto;

            /**
             * Verifies a ServiceDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServiceDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServiceDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceDescriptorProto;

            /**
             * Creates a plain object from a ServiceDescriptorProto message. Also converts values to other types if specified.
             * @param message ServiceDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ServiceDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServiceDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a MethodDescriptorProto. */
        interface IMethodDescriptorProto {

            /** MethodDescriptorProto name */
            name?: (string|null);

            /** MethodDescriptorProto input_type */
            input_type?: (string|null);

            /** MethodDescriptorProto output_type */
            output_type?: (string|null);

            /** MethodDescriptorProto options */
            options?: (google.protobuf.IMethodOptions|null);

            /** MethodDescriptorProto client_streaming */
            client_streaming?: (boolean|null);

            /** MethodDescriptorProto server_streaming */
            server_streaming?: (boolean|null);
        }

        /** Represents a MethodDescriptorProto. */
        class MethodDescriptorProto implements IMethodDescriptorProto {

            /**
             * Constructs a new MethodDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMethodDescriptorProto);

            /** MethodDescriptorProto name. */
            public name: string;

            /** MethodDescriptorProto input_type. */
            public input_type: string;

            /** MethodDescriptorProto output_type. */
            public output_type: string;

            /** MethodDescriptorProto options. */
            public options?: (google.protobuf.IMethodOptions|null);

            /** MethodDescriptorProto client_streaming. */
            public client_streaming: boolean;

            /** MethodDescriptorProto server_streaming. */
            public server_streaming: boolean;

            /**
             * Encodes the specified MethodDescriptorProto message. Does not implicitly {@link google.protobuf.MethodDescriptorProto.verify|verify} messages.
             * @param message MethodDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MethodDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.MethodDescriptorProto.verify|verify} messages.
             * @param message MethodDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MethodDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MethodDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodDescriptorProto;

            /**
             * Decodes a MethodDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MethodDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodDescriptorProto;

            /**
             * Verifies a MethodDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MethodDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MethodDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodDescriptorProto;

            /**
             * Creates a plain object from a MethodDescriptorProto message. Also converts values to other types if specified.
             * @param message MethodDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MethodDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MethodDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FileOptions. */
        interface IFileOptions {

            /** FileOptions java_package */
            java_package?: (string|null);

            /** FileOptions java_outer_classname */
            java_outer_classname?: (string|null);

            /** FileOptions java_multiple_files */
            java_multiple_files?: (boolean|null);

            /** FileOptions java_generate_equals_and_hash */
            java_generate_equals_and_hash?: (boolean|null);

            /** FileOptions java_string_check_utf8 */
            java_string_check_utf8?: (boolean|null);

            /** FileOptions optimize_for */
            optimize_for?: (google.protobuf.FileOptions.OptimizeMode|null);

            /** FileOptions go_package */
            go_package?: (string|null);

            /** FileOptions cc_generic_services */
            cc_generic_services?: (boolean|null);

            /** FileOptions java_generic_services */
            java_generic_services?: (boolean|null);

            /** FileOptions py_generic_services */
            py_generic_services?: (boolean|null);

            /** FileOptions deprecated */
            deprecated?: (boolean|null);

            /** FileOptions cc_enable_arenas */
            cc_enable_arenas?: (boolean|null);

            /** FileOptions objc_class_prefix */
            objc_class_prefix?: (string|null);

            /** FileOptions csharp_namespace */
            csharp_namespace?: (string|null);

            /** FileOptions uninterpreted_option */
            uninterpreted_option?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents a FileOptions. */
        class FileOptions implements IFileOptions {

            /**
             * Constructs a new FileOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileOptions);

            /** FileOptions java_package. */
            public java_package: string;

            /** FileOptions java_outer_classname. */
            public java_outer_classname: string;

            /** FileOptions java_multiple_files. */
            public java_multiple_files: boolean;

            /** FileOptions java_generate_equals_and_hash. */
            public java_generate_equals_and_hash: boolean;

            /** FileOptions java_string_check_utf8. */
            public java_string_check_utf8: boolean;

            /** FileOptions optimize_for. */
            public optimize_for: google.protobuf.FileOptions.OptimizeMode;

            /** FileOptions go_package. */
            public go_package: string;

            /** FileOptions cc_generic_services. */
            public cc_generic_services: boolean;

            /** FileOptions java_generic_services. */
            public java_generic_services: boolean;

            /** FileOptions py_generic_services. */
            public py_generic_services: boolean;

            /** FileOptions deprecated. */
            public deprecated: boolean;

            /** FileOptions cc_enable_arenas. */
            public cc_enable_arenas: boolean;

            /** FileOptions objc_class_prefix. */
            public objc_class_prefix: string;

            /** FileOptions csharp_namespace. */
            public csharp_namespace: string;

            /** FileOptions uninterpreted_option. */
            public uninterpreted_option: google.protobuf.IUninterpretedOption[];

            /**
             * Encodes the specified FileOptions message. Does not implicitly {@link google.protobuf.FileOptions.verify|verify} messages.
             * @param message FileOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileOptions message, length delimited. Does not implicitly {@link google.protobuf.FileOptions.verify|verify} messages.
             * @param message FileOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileOptions;

            /**
             * Decodes a FileOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileOptions;

            /**
             * Verifies a FileOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileOptions;

            /**
             * Creates a plain object from a FileOptions message. Also converts values to other types if specified.
             * @param message FileOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace FileOptions {

            /** OptimizeMode enum. */
            enum OptimizeMode {
                SPEED = 1,
                CODE_SIZE = 2,
                LITE_RUNTIME = 3
            }
        }

        /** Properties of a MessageOptions. */
        interface IMessageOptions {

            /** MessageOptions message_set_wire_format */
            message_set_wire_format?: (boolean|null);

            /** MessageOptions no_standard_descriptor_accessor */
            no_standard_descriptor_accessor?: (boolean|null);

            /** MessageOptions deprecated */
            deprecated?: (boolean|null);

            /** MessageOptions map_entry */
            map_entry?: (boolean|null);

            /** MessageOptions uninterpreted_option */
            uninterpreted_option?: (google.protobuf.IUninterpretedOption[]|null);

            /** MessageOptions .cosmos.msg.v1.signer */
            ".cosmos.msg.v1.signer"?: (string[]|null);
        }

        /** Represents a MessageOptions. */
        class MessageOptions implements IMessageOptions {

            /**
             * Constructs a new MessageOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMessageOptions);

            /** MessageOptions message_set_wire_format. */
            public message_set_wire_format: boolean;

            /** MessageOptions no_standard_descriptor_accessor. */
            public no_standard_descriptor_accessor: boolean;

            /** MessageOptions deprecated. */
            public deprecated: boolean;

            /** MessageOptions map_entry. */
            public map_entry: boolean;

            /** MessageOptions uninterpreted_option. */
            public uninterpreted_option: google.protobuf.IUninterpretedOption[];

            /**
             * Encodes the specified MessageOptions message. Does not implicitly {@link google.protobuf.MessageOptions.verify|verify} messages.
             * @param message MessageOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MessageOptions message, length delimited. Does not implicitly {@link google.protobuf.MessageOptions.verify|verify} messages.
             * @param message MessageOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MessageOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MessageOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MessageOptions;

            /**
             * Decodes a MessageOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MessageOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MessageOptions;

            /**
             * Verifies a MessageOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MessageOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MessageOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MessageOptions;

            /**
             * Creates a plain object from a MessageOptions message. Also converts values to other types if specified.
             * @param message MessageOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MessageOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MessageOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FieldOptions. */
        interface IFieldOptions {

            /** FieldOptions ctype */
            ctype?: (google.protobuf.FieldOptions.CType|null);

            /** FieldOptions packed */
            packed?: (boolean|null);

            /** FieldOptions jstype */
            jstype?: (google.protobuf.FieldOptions.JSType|null);

            /** FieldOptions lazy */
            lazy?: (boolean|null);

            /** FieldOptions deprecated */
            deprecated?: (boolean|null);

            /** FieldOptions weak */
            weak?: (boolean|null);

            /** FieldOptions uninterpreted_option */
            uninterpreted_option?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents a FieldOptions. */
        class FieldOptions implements IFieldOptions {

            /**
             * Constructs a new FieldOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFieldOptions);

            /** FieldOptions ctype. */
            public ctype: google.protobuf.FieldOptions.CType;

            /** FieldOptions packed. */
            public packed: boolean;

            /** FieldOptions jstype. */
            public jstype: google.protobuf.FieldOptions.JSType;

            /** FieldOptions lazy. */
            public lazy: boolean;

            /** FieldOptions deprecated. */
            public deprecated: boolean;

            /** FieldOptions weak. */
            public weak: boolean;

            /** FieldOptions uninterpreted_option. */
            public uninterpreted_option: google.protobuf.IUninterpretedOption[];

            /**
             * Encodes the specified FieldOptions message. Does not implicitly {@link google.protobuf.FieldOptions.verify|verify} messages.
             * @param message FieldOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldOptions message, length delimited. Does not implicitly {@link google.protobuf.FieldOptions.verify|verify} messages.
             * @param message FieldOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldOptions;

            /**
             * Decodes a FieldOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldOptions;

            /**
             * Verifies a FieldOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FieldOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FieldOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldOptions;

            /**
             * Creates a plain object from a FieldOptions message. Also converts values to other types if specified.
             * @param message FieldOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FieldOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FieldOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace FieldOptions {

            /** CType enum. */
            enum CType {
                STRING = 0,
                CORD = 1,
                STRING_PIECE = 2
            }

            /** JSType enum. */
            enum JSType {
                JS_NORMAL = 0,
                JS_STRING = 1,
                JS_NUMBER = 2
            }
        }

        /** Properties of an OneofOptions. */
        interface IOneofOptions {

            /** OneofOptions uninterpreted_option */
            uninterpreted_option?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an OneofOptions. */
        class OneofOptions implements IOneofOptions {

            /**
             * Constructs a new OneofOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IOneofOptions);

            /** OneofOptions uninterpreted_option. */
            public uninterpreted_option: google.protobuf.IUninterpretedOption[];

            /**
             * Encodes the specified OneofOptions message. Does not implicitly {@link google.protobuf.OneofOptions.verify|verify} messages.
             * @param message OneofOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofOptions message, length delimited. Does not implicitly {@link google.protobuf.OneofOptions.verify|verify} messages.
             * @param message OneofOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofOptions;

            /**
             * Decodes an OneofOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofOptions;

            /**
             * Verifies an OneofOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofOptions;

            /**
             * Creates a plain object from an OneofOptions message. Also converts values to other types if specified.
             * @param message OneofOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.OneofOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an EnumOptions. */
        interface IEnumOptions {

            /** EnumOptions allow_alias */
            allow_alias?: (boolean|null);

            /** EnumOptions deprecated */
            deprecated?: (boolean|null);

            /** EnumOptions uninterpreted_option */
            uninterpreted_option?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an EnumOptions. */
        class EnumOptions implements IEnumOptions {

            /**
             * Constructs a new EnumOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumOptions);

            /** EnumOptions allow_alias. */
            public allow_alias: boolean;

            /** EnumOptions deprecated. */
            public deprecated: boolean;

            /** EnumOptions uninterpreted_option. */
            public uninterpreted_option: google.protobuf.IUninterpretedOption[];

            /**
             * Encodes the specified EnumOptions message. Does not implicitly {@link google.protobuf.EnumOptions.verify|verify} messages.
             * @param message EnumOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumOptions message, length delimited. Does not implicitly {@link google.protobuf.EnumOptions.verify|verify} messages.
             * @param message EnumOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumOptions;

            /**
             * Decodes an EnumOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumOptions;

            /**
             * Verifies an EnumOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumOptions;

            /**
             * Creates a plain object from an EnumOptions message. Also converts values to other types if specified.
             * @param message EnumOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an EnumValueOptions. */
        interface IEnumValueOptions {

            /** EnumValueOptions deprecated */
            deprecated?: (boolean|null);

            /** EnumValueOptions uninterpreted_option */
            uninterpreted_option?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an EnumValueOptions. */
        class EnumValueOptions implements IEnumValueOptions {

            /**
             * Constructs a new EnumValueOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumValueOptions);

            /** EnumValueOptions deprecated. */
            public deprecated: boolean;

            /** EnumValueOptions uninterpreted_option. */
            public uninterpreted_option: google.protobuf.IUninterpretedOption[];

            /**
             * Encodes the specified EnumValueOptions message. Does not implicitly {@link google.protobuf.EnumValueOptions.verify|verify} messages.
             * @param message EnumValueOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumValueOptions message, length delimited. Does not implicitly {@link google.protobuf.EnumValueOptions.verify|verify} messages.
             * @param message EnumValueOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumValueOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumValueOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueOptions;

            /**
             * Decodes an EnumValueOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumValueOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueOptions;

            /**
             * Verifies an EnumValueOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumValueOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumValueOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueOptions;

            /**
             * Creates a plain object from an EnumValueOptions message. Also converts values to other types if specified.
             * @param message EnumValueOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumValueOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumValueOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ServiceOptions. */
        interface IServiceOptions {

            /** ServiceOptions deprecated */
            deprecated?: (boolean|null);

            /** ServiceOptions uninterpreted_option */
            uninterpreted_option?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents a ServiceOptions. */
        class ServiceOptions implements IServiceOptions {

            /**
             * Constructs a new ServiceOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IServiceOptions);

            /** ServiceOptions deprecated. */
            public deprecated: boolean;

            /** ServiceOptions uninterpreted_option. */
            public uninterpreted_option: google.protobuf.IUninterpretedOption[];

            /**
             * Encodes the specified ServiceOptions message. Does not implicitly {@link google.protobuf.ServiceOptions.verify|verify} messages.
             * @param message ServiceOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServiceOptions message, length delimited. Does not implicitly {@link google.protobuf.ServiceOptions.verify|verify} messages.
             * @param message ServiceOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServiceOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServiceOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceOptions;

            /**
             * Decodes a ServiceOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServiceOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceOptions;

            /**
             * Verifies a ServiceOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServiceOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServiceOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceOptions;

            /**
             * Creates a plain object from a ServiceOptions message. Also converts values to other types if specified.
             * @param message ServiceOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ServiceOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServiceOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a MethodOptions. */
        interface IMethodOptions {

            /** MethodOptions deprecated */
            deprecated?: (boolean|null);

            /** MethodOptions uninterpreted_option */
            uninterpreted_option?: (google.protobuf.IUninterpretedOption[]|null);

            /** MethodOptions .google.api.http */
            ".google.api.http"?: (google.api.IHttpRule|null);
        }

        /** Represents a MethodOptions. */
        class MethodOptions implements IMethodOptions {

            /**
             * Constructs a new MethodOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMethodOptions);

            /** MethodOptions deprecated. */
            public deprecated: boolean;

            /** MethodOptions uninterpreted_option. */
            public uninterpreted_option: google.protobuf.IUninterpretedOption[];

            /**
             * Encodes the specified MethodOptions message. Does not implicitly {@link google.protobuf.MethodOptions.verify|verify} messages.
             * @param message MethodOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MethodOptions message, length delimited. Does not implicitly {@link google.protobuf.MethodOptions.verify|verify} messages.
             * @param message MethodOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MethodOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MethodOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodOptions;

            /**
             * Decodes a MethodOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MethodOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodOptions;

            /**
             * Verifies a MethodOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MethodOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MethodOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodOptions;

            /**
             * Creates a plain object from a MethodOptions message. Also converts values to other types if specified.
             * @param message MethodOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MethodOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MethodOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an UninterpretedOption. */
        interface IUninterpretedOption {

            /** UninterpretedOption name */
            name?: (google.protobuf.UninterpretedOption.INamePart[]|null);

            /** UninterpretedOption identifier_value */
            identifier_value?: (string|null);

            /** UninterpretedOption positive_int_value */
            positive_int_value?: (number|null);

            /** UninterpretedOption negative_int_value */
            negative_int_value?: (number|null);

            /** UninterpretedOption double_value */
            double_value?: (number|null);

            /** UninterpretedOption string_value */
            string_value?: (Uint8Array|null);

            /** UninterpretedOption aggregate_value */
            aggregate_value?: (string|null);
        }

        /** Represents an UninterpretedOption. */
        class UninterpretedOption implements IUninterpretedOption {

            /**
             * Constructs a new UninterpretedOption.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IUninterpretedOption);

            /** UninterpretedOption name. */
            public name: google.protobuf.UninterpretedOption.INamePart[];

            /** UninterpretedOption identifier_value. */
            public identifier_value: string;

            /** UninterpretedOption positive_int_value. */
            public positive_int_value: number;

            /** UninterpretedOption negative_int_value. */
            public negative_int_value: number;

            /** UninterpretedOption double_value. */
            public double_value: number;

            /** UninterpretedOption string_value. */
            public string_value: Uint8Array;

            /** UninterpretedOption aggregate_value. */
            public aggregate_value: string;

            /**
             * Encodes the specified UninterpretedOption message. Does not implicitly {@link google.protobuf.UninterpretedOption.verify|verify} messages.
             * @param message UninterpretedOption message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UninterpretedOption message, length delimited. Does not implicitly {@link google.protobuf.UninterpretedOption.verify|verify} messages.
             * @param message UninterpretedOption message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UninterpretedOption message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UninterpretedOption
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption;

            /**
             * Decodes an UninterpretedOption message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UninterpretedOption
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption;

            /**
             * Verifies an UninterpretedOption message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UninterpretedOption message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UninterpretedOption
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption;

            /**
             * Creates a plain object from an UninterpretedOption message. Also converts values to other types if specified.
             * @param message UninterpretedOption
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.UninterpretedOption, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UninterpretedOption to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace UninterpretedOption {

            /** Properties of a NamePart. */
            interface INamePart {

                /** NamePart name_part */
                name_part: string;

                /** NamePart is_extension */
                is_extension: boolean;
            }

            /** Represents a NamePart. */
            class NamePart implements INamePart {

                /**
                 * Constructs a new NamePart.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.UninterpretedOption.INamePart);

                /** NamePart name_part. */
                public name_part: string;

                /** NamePart is_extension. */
                public is_extension: boolean;

                /**
                 * Encodes the specified NamePart message. Does not implicitly {@link google.protobuf.UninterpretedOption.NamePart.verify|verify} messages.
                 * @param message NamePart message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified NamePart message, length delimited. Does not implicitly {@link google.protobuf.UninterpretedOption.NamePart.verify|verify} messages.
                 * @param message NamePart message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a NamePart message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns NamePart
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Decodes a NamePart message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns NamePart
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Verifies a NamePart message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a NamePart message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns NamePart
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Creates a plain object from a NamePart message. Also converts values to other types if specified.
                 * @param message NamePart
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.UninterpretedOption.NamePart, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this NamePart to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a SourceCodeInfo. */
        interface ISourceCodeInfo {

            /** SourceCodeInfo location */
            location?: (google.protobuf.SourceCodeInfo.ILocation[]|null);
        }

        /** Represents a SourceCodeInfo. */
        class SourceCodeInfo implements ISourceCodeInfo {

            /**
             * Constructs a new SourceCodeInfo.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ISourceCodeInfo);

            /** SourceCodeInfo location. */
            public location: google.protobuf.SourceCodeInfo.ILocation[];

            /**
             * Encodes the specified SourceCodeInfo message. Does not implicitly {@link google.protobuf.SourceCodeInfo.verify|verify} messages.
             * @param message SourceCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SourceCodeInfo message, length delimited. Does not implicitly {@link google.protobuf.SourceCodeInfo.verify|verify} messages.
             * @param message SourceCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SourceCodeInfo message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SourceCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo;

            /**
             * Decodes a SourceCodeInfo message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SourceCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo;

            /**
             * Verifies a SourceCodeInfo message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SourceCodeInfo message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SourceCodeInfo
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo;

            /**
             * Creates a plain object from a SourceCodeInfo message. Also converts values to other types if specified.
             * @param message SourceCodeInfo
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.SourceCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SourceCodeInfo to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace SourceCodeInfo {

            /** Properties of a Location. */
            interface ILocation {

                /** Location path */
                path?: (number[]|null);

                /** Location span */
                span?: (number[]|null);

                /** Location leading_comments */
                leading_comments?: (string|null);

                /** Location trailing_comments */
                trailing_comments?: (string|null);

                /** Location leading_detached_comments */
                leading_detached_comments?: (string[]|null);
            }

            /** Represents a Location. */
            class Location implements ILocation {

                /**
                 * Constructs a new Location.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.SourceCodeInfo.ILocation);

                /** Location path. */
                public path: number[];

                /** Location span. */
                public span: number[];

                /** Location leading_comments. */
                public leading_comments: string;

                /** Location trailing_comments. */
                public trailing_comments: string;

                /** Location leading_detached_comments. */
                public leading_detached_comments: string[];

                /**
                 * Encodes the specified Location message. Does not implicitly {@link google.protobuf.SourceCodeInfo.Location.verify|verify} messages.
                 * @param message Location message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Location message, length delimited. Does not implicitly {@link google.protobuf.SourceCodeInfo.Location.verify|verify} messages.
                 * @param message Location message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Location message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Location
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Decodes a Location message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Location
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Verifies a Location message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Location message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Location
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Creates a plain object from a Location message. Also converts values to other types if specified.
                 * @param message Location
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.SourceCodeInfo.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Location to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a GeneratedCodeInfo. */
        interface IGeneratedCodeInfo {

            /** GeneratedCodeInfo annotation */
            annotation?: (google.protobuf.GeneratedCodeInfo.IAnnotation[]|null);
        }

        /** Represents a GeneratedCodeInfo. */
        class GeneratedCodeInfo implements IGeneratedCodeInfo {

            /**
             * Constructs a new GeneratedCodeInfo.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IGeneratedCodeInfo);

            /** GeneratedCodeInfo annotation. */
            public annotation: google.protobuf.GeneratedCodeInfo.IAnnotation[];

            /**
             * Encodes the specified GeneratedCodeInfo message. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.verify|verify} messages.
             * @param message GeneratedCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GeneratedCodeInfo message, length delimited. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.verify|verify} messages.
             * @param message GeneratedCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GeneratedCodeInfo message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GeneratedCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo;

            /**
             * Decodes a GeneratedCodeInfo message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GeneratedCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo;

            /**
             * Verifies a GeneratedCodeInfo message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GeneratedCodeInfo message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GeneratedCodeInfo
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo;

            /**
             * Creates a plain object from a GeneratedCodeInfo message. Also converts values to other types if specified.
             * @param message GeneratedCodeInfo
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.GeneratedCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GeneratedCodeInfo to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace GeneratedCodeInfo {

            /** Properties of an Annotation. */
            interface IAnnotation {

                /** Annotation path */
                path?: (number[]|null);

                /** Annotation source_file */
                source_file?: (string|null);

                /** Annotation begin */
                begin?: (number|null);

                /** Annotation end */
                end?: (number|null);
            }

            /** Represents an Annotation. */
            class Annotation implements IAnnotation {

                /**
                 * Constructs a new Annotation.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation);

                /** Annotation path. */
                public path: number[];

                /** Annotation source_file. */
                public source_file: string;

                /** Annotation begin. */
                public begin: number;

                /** Annotation end. */
                public end: number;

                /**
                 * Encodes the specified Annotation message. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.Annotation.verify|verify} messages.
                 * @param message Annotation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Annotation message, length delimited. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.Annotation.verify|verify} messages.
                 * @param message Annotation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Annotation message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Annotation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Decodes an Annotation message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Annotation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Verifies an Annotation message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Annotation message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Annotation
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Creates a plain object from an Annotation message. Also converts values to other types if specified.
                 * @param message Annotation
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.GeneratedCodeInfo.Annotation, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Annotation to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of an Any. */
        interface IAny {

            /** Any type_url */
            type_url?: (string|null);

            /** Any value */
            value?: (Uint8Array|null);
        }

        /** Represents an Any. */
        class Any implements IAny {

            /**
             * Constructs a new Any.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IAny);

            /** Any type_url. */
            public type_url: string;

            /** Any value. */
            public value: Uint8Array;

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IAny, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IAny, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Any;

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Any;

            /**
             * Verifies an Any message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Any
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Any;

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @param message Any
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Any, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Any to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: number;

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace api. */
    namespace api {

        /** Properties of a Http. */
        interface IHttp {

            /** Http rules */
            rules?: (google.api.IHttpRule[]|null);
        }

        /** Represents a Http. */
        class Http implements IHttp {

            /**
             * Constructs a new Http.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.IHttp);

            /** Http rules. */
            public rules: google.api.IHttpRule[];

            /**
             * Encodes the specified Http message. Does not implicitly {@link google.api.Http.verify|verify} messages.
             * @param message Http message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Http message, length delimited. Does not implicitly {@link google.api.Http.verify|verify} messages.
             * @param message Http message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Http message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.Http;

            /**
             * Decodes a Http message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.Http;

            /**
             * Verifies a Http message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Http message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Http
             */
            public static fromObject(object: { [k: string]: any }): google.api.Http;

            /**
             * Creates a plain object from a Http message. Also converts values to other types if specified.
             * @param message Http
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.Http, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Http to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a HttpRule. */
        interface IHttpRule {

            /** HttpRule get */
            get?: (string|null);

            /** HttpRule put */
            put?: (string|null);

            /** HttpRule post */
            post?: (string|null);

            /** HttpRule delete */
            "delete"?: (string|null);

            /** HttpRule patch */
            patch?: (string|null);

            /** HttpRule custom */
            custom?: (google.api.ICustomHttpPattern|null);

            /** HttpRule selector */
            selector?: (string|null);

            /** HttpRule body */
            body?: (string|null);

            /** HttpRule additional_bindings */
            additional_bindings?: (google.api.IHttpRule[]|null);
        }

        /** Represents a HttpRule. */
        class HttpRule implements IHttpRule {

            /**
             * Constructs a new HttpRule.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.IHttpRule);

            /** HttpRule get. */
            public get?: (string|null);

            /** HttpRule put. */
            public put?: (string|null);

            /** HttpRule post. */
            public post?: (string|null);

            /** HttpRule delete. */
            public delete?: (string|null);

            /** HttpRule patch. */
            public patch?: (string|null);

            /** HttpRule custom. */
            public custom?: (google.api.ICustomHttpPattern|null);

            /** HttpRule selector. */
            public selector: string;

            /** HttpRule body. */
            public body: string;

            /** HttpRule additional_bindings. */
            public additional_bindings: google.api.IHttpRule[];

            /** HttpRule pattern. */
            public pattern?: ("get"|"put"|"post"|"delete"|"patch"|"custom");

            /**
             * Encodes the specified HttpRule message. Does not implicitly {@link google.api.HttpRule.verify|verify} messages.
             * @param message HttpRule message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified HttpRule message, length delimited. Does not implicitly {@link google.api.HttpRule.verify|verify} messages.
             * @param message HttpRule message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a HttpRule message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns HttpRule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.HttpRule;

            /**
             * Decodes a HttpRule message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns HttpRule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.HttpRule;

            /**
             * Verifies a HttpRule message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a HttpRule message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns HttpRule
             */
            public static fromObject(object: { [k: string]: any }): google.api.HttpRule;

            /**
             * Creates a plain object from a HttpRule message. Also converts values to other types if specified.
             * @param message HttpRule
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.HttpRule, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this HttpRule to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a CustomHttpPattern. */
        interface ICustomHttpPattern {

            /** CustomHttpPattern kind */
            kind?: (string|null);

            /** CustomHttpPattern path */
            path?: (string|null);
        }

        /** Represents a CustomHttpPattern. */
        class CustomHttpPattern implements ICustomHttpPattern {

            /**
             * Constructs a new CustomHttpPattern.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.ICustomHttpPattern);

            /** CustomHttpPattern kind. */
            public kind: string;

            /** CustomHttpPattern path. */
            public path: string;

            /**
             * Encodes the specified CustomHttpPattern message. Does not implicitly {@link google.api.CustomHttpPattern.verify|verify} messages.
             * @param message CustomHttpPattern message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CustomHttpPattern message, length delimited. Does not implicitly {@link google.api.CustomHttpPattern.verify|verify} messages.
             * @param message CustomHttpPattern message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CustomHttpPattern message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CustomHttpPattern
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.CustomHttpPattern;

            /**
             * Decodes a CustomHttpPattern message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CustomHttpPattern
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.CustomHttpPattern;

            /**
             * Verifies a CustomHttpPattern message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CustomHttpPattern message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CustomHttpPattern
             */
            public static fromObject(object: { [k: string]: any }): google.api.CustomHttpPattern;

            /**
             * Creates a plain object from a CustomHttpPattern message. Also converts values to other types if specified.
             * @param message CustomHttpPattern
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.CustomHttpPattern, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CustomHttpPattern to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
