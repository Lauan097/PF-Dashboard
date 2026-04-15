// import {
//   Document,
//   Page,
//   Text,
//   View,
//   Image,
//   StyleSheet,
//   Font,
// } from "@react-pdf/renderer";
// import type { MemberRecord } from "@/types/user";

// Font.register({
//   family: "Helvetica",
//   fonts: [],
// });

// const STATUS_LABELS: Record<string, string> = {
//   Active: "Ativo",
//   Inactive: "Inativo",
//   InAcademy: "Em Academia",
//   PendingForm: "Ficha Pendente",
//   Suspended: "Suspenso",
//   Exonerated: "Exonerado",
// };

// const c = {
//   bg: "#d4d4d8", // zinc-300
//   bgLight: "#e4e4e7", // zinc-200
//   border: "#3f3f46", // zinc-700
//   border2: "#52525b", // zinc-600
//   text: "#27272a", // zinc-800
//   textDark: "#18181b", // zinc-900
//   textMid: "#52525b", // zinc-600
//   textLight: "#71717a", // zinc-500
//   red: "#7f1d1d",
//   redBg: "rgba(127,29,29,0.15)",
// };

// const s = StyleSheet.create({
//   page: {
//     backgroundColor: "white",
//     padding: 30,
//     fontSize: 9,
//     fontFamily: "Helvetica",
//     color: c.text,
//   },
//   doc: {
//     backgroundColor: c.bg,
//     padding: 24,
//   },

//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     borderBottomWidth: 2,
//     borderBottomColor: c.border,
//     paddingBottom: 12,
//     marginBottom: 16,
//   },
//   headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
//   logo: { width: 36, height: 36 },
//   orgTitle: {
//     fontSize: 14,
//     fontFamily: "Helvetica-Bold",
//     letterSpacing: 2,
//     color: c.textDark,
//     textTransform: "uppercase",
//   },
//   orgSub: {
//     fontSize: 7,
//     color: c.textMid,
//     letterSpacing: 1.5,
//     textTransform: "uppercase",
//   },
//   headerRight: { alignItems: "flex-end" },
//   matriculaLabel: { fontSize: 7, color: c.text, textTransform: "uppercase" },
//   matriculaValue: {
//     fontSize: 14,
//     fontFamily: "Helvetica-Bold",
//     color: c.textMid,
//   },

//   photoRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
//   photo: {
//     width: 80,
//     height: 100,
//     objectFit: "cover",
//     borderWidth: 2,
//     borderColor: c.border,
//   },
//   mainFields: { flex: 1, justifyContent: "flex-end", gap: 8 },

//   fieldRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
//   fieldLabel: {
//     fontSize: 7,
//     textTransform: "uppercase",
//     letterSpacing: 1,
//     color: "#000",
//     flexShrink: 0,
//   },
//   fieldValue: {
//     fontSize: 8,
//     fontFamily: "Helvetica-Bold",
//     color: c.text,
//     borderBottomWidth: 0.5,
//     borderBottomColor: c.border,
//     flex: 1,
//     paddingBottom: 1,
//   },

//   section: {
//     borderWidth: 0.5,
//     borderColor: c.border,
//     padding: 10,
//     marginBottom: 10,
//     gap: 8,
//   },
//   sectionTitle: {
//     fontSize: 7,
//     fontFamily: "Helvetica-Bold",
//     textTransform: "uppercase",
//     letterSpacing: 1.5,
//     color: c.textMid,
//     marginBottom: 6,
//   },
//   row: { flexDirection: "row", gap: 8 },

//   checkRow: { flexDirection: "row", alignItems: "center", gap: 4 },
//   checkLabel: {
//     fontSize: 7,
//     textTransform: "uppercase",
//     letterSpacing: 1,
//     color: "#000",
//     marginRight: 4,
//   },
//   checkBox: {
//     width: 9,
//     height: 9,
//     borderWidth: 0.5,
//     borderColor: c.border2,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   checkBoxFilled: { backgroundColor: c.bgLight },
//   checkX: { fontSize: 7, color: "#000" },
//   checkOptionLabel: { fontSize: 8, color: c.text },

//   listItem: { fontSize: 8, color: c.text, marginLeft: 8 },
//   notesBox: {
//     backgroundColor: c.bgLight,
//     borderWidth: 0.5,
//     borderColor: c.border,
//     padding: 6,
//     minHeight: 40,
//   },
//   notesText: { fontSize: 8, color: c.text },

//   oocWrapper: {
//     borderWidth: 0.5,
//     borderColor: c.border,
//     padding: 10,
//     marginBottom: 10,
//     opacity: 0.8,
//     position: "relative",
//   },
//   oocBadge: {
//     backgroundColor: c.redBg,
//     paddingHorizontal: 5,
//     paddingVertical: 2,
//     alignSelf: "flex-end",
//     marginBottom: 6,
//   },
//   oocBadgeText: {
//     fontSize: 6,
//     color: c.red,
//     fontFamily: "Helvetica-Bold",
//     textTransform: "uppercase",
//     letterSpacing: 1,
//   },

//   sigRow: { flexDirection: "row", gap: 24, paddingTop: 16 },
//   sigCol: { flex: 1, alignItems: "center", gap: 4 },
//   sigImage: { maxHeight: 50, maxWidth: 140, objectFit: "contain" },
//   sigLine: {
//     width: "100%",
//     borderBottomWidth: 0.5,
//     borderBottomColor: c.border2,
//     marginTop: 2,
//   },
//   sigLabel: {
//     fontSize: 7,
//     textTransform: "uppercase",
//     letterSpacing: 1.5,
//     color: c.text,
//   },
// });

// function Field({
//   label,
//   value,
//   style,
// }: {
//   label: string;
//   value: string;
//   style?: object;
// }) {
//   return (
//     <View style={[s.fieldRow, style as never]}>
//       <Text style={s.fieldLabel}>{label}: </Text>
//       <Text style={s.fieldValue}>{value}</Text>
//     </View>
//   );
// }

// function CheckToggle({ checked }: { checked: boolean }) {
//   return (
//     <View style={[s.checkBox, checked ? s.checkBoxFilled : {}]}>
//       {checked && <Text style={s.checkX}>X</Text>}
//     </View>
//   );
// }

// function fmtDate(v: string | null) {
//   if (!v) return "N/A";
//   return new Date(v).toLocaleDateString("pt-BR");
// }

// interface RecordPDFProps {
//   member: MemberRecord;
//   logoSrc?: string;
//   photoSrc?: string;
//   signatureSrc?: string;
// }

// export function RecordPDF({
//   member,
//   logoSrc,
//   photoSrc,
//   signatureSrc,
// }: RecordPDFProps) {
//   const specializations: string[] = Array.isArray(member.specializations)
//     ? (member.specializations as unknown[]).map(String)
//     : typeof member.specializations === "string" && member.specializations
//       ? [member.specializations as string]
//       : [];

//   const awards: string[] = Array.isArray(member.awards)
//     ? (member.awards as unknown[]).map(String)
//     : typeof member.awards === "string" && member.awards
//       ? [member.awards as string]
//       : [];

//   return (
//     <Document>
//       <Page size="A4" style={s.page}>
//         <View style={s.doc}>
//           <View style={s.headerRow}>
//             <View style={s.headerLeft}>
//               {/* eslint-disable-next-line jsx-a11y/alt-text */}
//               <Image src={logoSrc ?? ""} style={s.logo} />
//               <View>
//                 <Text style={s.orgTitle}>Polícia Federal</Text>
//                 <Text style={s.orgSub}>
//                   Departamento de Gestão Administrativa
//                 </Text>
//               </View>
//             </View>
//             <View style={s.headerRight}>
//               <Text style={s.matriculaLabel}>Matrícula</Text>
//               <Text style={s.matriculaValue}>
//                 {member.registration ?? "N/A"}
//               </Text>
//             </View>
//           </View>

//           {/* Foto + dados principais */}
//           <View style={s.photoRow}>
//             {/* eslint-disable-next-line jsx-a11y/alt-text */}
//             <Image
//               src={photoSrc ?? "https://cdn.discordapp.com/embed/avatars/0.png"}
//               style={s.photo}
//               priority
//             />
//             <View style={s.mainFields}>
//               <Field
//                 label="Nome do Agente"
//                 value={member.gameName ?? "N/A"}
//                 style={{ width: "100%" }}
//               />
//               <View style={s.row}>
//                 <Field
//                   label="Cargo/Patente"
//                   value={member.rank ?? "N/A"}
//                   style={{ flex: 2 }}
//                 />
//                 <Field
//                   label="ID Interno"
//                   value={member.internalId ?? "N/A"}
//                   style={{ flex: 1 }}
//                 />
//               </View>
//               <View style={s.row}>
//                 <Field
//                   label="Unidade"
//                   value={member.unit ?? "N/A"}
//                   style={{ flex: 1 }}
//                 />
//                 <Field
//                   label="Departamento"
//                   value={member.department ?? "N/A"}
//                   style={{ flex: 2 }}
//                 />
//               </View>
//             </View>
//           </View>

//           <View style={s.section}>
//             <Text style={s.sectionTitle}>1. Identidade Civil (In-Game)</Text>
//             <View style={s.row}>
//               <Field
//                 label="Passaporte (ID)"
//                 value={member.gameId ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Telefone"
//                 value={member.phone ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Estado Civil"
//                 value={member.maritalStatus ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Nível/Level"
//                 value={member.level != null ? String(member.level) : "N/A"}
//                 style={{ flex: 1 }}
//               />
//             </View>
//             <View style={s.row}>
//               <Field
//                 label="Gênero"
//                 value={member.gender ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Tipo Sanguíneo"
//                 value={member.bloodType ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//               <View style={[s.fieldRow, { flex: 1 }]}>
//                 <Text style={s.checkLabel}>Antecedentes:</Text>
//                 <View style={s.checkRow}>
//                   <CheckToggle checked={member.backgrounds === true} />
//                   <Text style={s.checkOptionLabel}> Sim</Text>
//                 </View>
//                 <View style={[s.checkRow, { marginLeft: 6 }]}>
//                   <CheckToggle checked={!member.backgrounds} />
//                   <Text style={s.checkOptionLabel}> Não</Text>
//                 </View>
//               </View>
//             </View>
//           </View>

//           <View style={s.section}>
//             <Text style={s.sectionTitle}>2. Dados Institucionais</Text>
//             <View style={s.row}>
//               <Field
//                 label="Data de Admissão"
//                 value={fmtDate(member.admissionDate)}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Nível de Acesso"
//                 value={
//                   member.accessLevel != null
//                     ? `Nível ${member.accessLevel}`
//                     : "N/A"
//                 }
//                 style={{ flex: 1 }}
//               />
//               <View style={[s.fieldRow, { flex: 1 }]}>
//                 <Text style={s.checkLabel}>Porte de Arma:</Text>
//                 <View style={s.checkRow}>
//                   <CheckToggle checked={member.weaponPermit === true} />
//                   <Text style={s.checkOptionLabel}> Sim</Text>
//                 </View>
//                 <View style={[s.checkRow, { marginLeft: 6 }]}>
//                   <CheckToggle checked={member.weaponPermit !== true} />
//                   <Text style={s.checkOptionLabel}> Não</Text>
//                 </View>
//               </View>
//             </View>
//             <View style={s.row}>
//               <Field
//                 label="Status Operacional"
//                 value={STATUS_LABELS[member.status] ?? member.status}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="ID do Supervisor"
//                 value={member.supervisorId ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//             </View>
//           </View>

//           <View style={s.section}>
//             <Text style={s.sectionTitle}>
//               3. Qualificações e Observações Internas
//             </Text>
//             <View style={s.row}>
//               <View style={{ flex: 1, gap: 4 }}>
//                 <Text style={s.checkLabel}>Especializações:</Text>
//                 {specializations.length > 0 ? (
//                   specializations.map((item, i) => (
//                     <Text key={i} style={s.listItem}>
//                       • {item}
//                     </Text>
//                   ))
//                 ) : (
//                   <Text style={s.listItem}>N/A</Text>
//                 )}
//               </View>
//               <View style={{ flex: 1, gap: 4 }}>
//                 <Text style={s.checkLabel}>Condecorações:</Text>
//                 {awards.length > 0 ? (
//                   awards.map((item, i) => (
//                     <Text key={i} style={s.listItem}>
//                       • {item}
//                     </Text>
//                   ))
//                 ) : (
//                   <Text style={s.listItem}>N/A</Text>
//                 )}
//               </View>
//             </View>
//             <View>
//               <Text style={[s.checkLabel, { marginBottom: 3 }]}>
//                 Anotações:
//               </Text>
//               <View style={s.notesBox}>
//                 <Text style={s.notesText}>{member.internalNotes ?? "N/A"}</Text>
//               </View>
//             </View>
//           </View>

//           <View style={s.section}>
//             <View style={s.oocBadge}>
//               <Text style={s.oocBadgeText}>Dados Sensíveis - OOC</Text>
//             </View>
//             <Text style={s.sectionTitle}>4. Dados Pessoais (Discord)</Text>
//             <View style={s.row}>
//               <Field
//                 label="Discord Tag"
//                 value={member.userTag ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Discord ID"
//                 value={member.userId}
//                 style={{ flex: 1 }}
//               />
//             </View>
//             <View style={s.row}>
//               <Field
//                 label="Nome Real"
//                 value={member.realName ?? "N/A"}
//                 style={{ flex: 2 }}
//               />
//               <Field
//                 label="Nascimento"
//                 value={fmtDate(member.birthDate)}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Telefone"
//                 value={member.realPhone ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//             </View>
//             <View style={s.row}>
//               <Field
//                 label="Cidade e Estado"
//                 value={member.cityAndState ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Status de Trabalho"
//                 value={member.workStatus ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//             </View>
//             <View style={s.row}>
//               <Field
//                 label="Turnos Disponíveis"
//                 value={member.availableShifts ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//               <Field
//                 label="Email"
//                 value={member.email ?? "N/A"}
//                 style={{ flex: 1 }}
//               />
//             </View>
//           </View>

//           <View style={s.sigRow}>
//             <View style={s.sigCol}>
//               {signatureSrc ? (
//                 // eslint-disable-next-line jsx-a11y/alt-text
//                 <Image src={signatureSrc} style={s.sigImage} />
//               ) : (
//                 <Text
//                   style={{
//                     fontSize: 8,
//                     fontStyle: "italic",
//                     color: c.textLight,
//                   }}
//                 >
//                   Sem assinatura
//                 </Text>
//               )}
//               <View style={s.sigLine} />
//               <Text style={s.sigLabel}>Assinatura do Membro</Text>
//             </View>
//             <View style={s.sigCol}>
//               <View style={{ height: 50 }} />
//               <View style={s.sigLine} />
//               <Text style={s.sigLabel}>Assinatura do Diretor</Text>
//             </View>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   );
// }
