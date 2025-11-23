"use client";

import type { NodeViewRendererProps } from "@tiptap/core";
import { Color } from "@tiptap/extension-color";
import FileHandler from "@tiptap/extension-file-handler";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import "./tiptap-styles.css";

// 리사이즈 가능한 드래그 가능한 이미지 확장
const ResizableDraggableImage = Image.extend({
	draggable: true,
	isolating: true,
	addNodeView() {
		return ({
			node,
			getPos,
			HTMLAttributes,
			editor,
		}: NodeViewRendererProps & {
			node: ProseMirrorNode;
			HTMLAttributes: Record<string, unknown>;
			editor: Editor;
		}) => {
			const img = document.createElement("img");
			img.src = HTMLAttributes.src || "";
			img.alt = HTMLAttributes.alt || "";

			// 이미지 속성 복사
			Object.entries(HTMLAttributes).forEach(([key, value]) => {
				if (value == null) return;
				if (key === "width" || key === "height") return;
				img.setAttribute(key, String(value));
			});

			// 초기 크기 설정
			if (HTMLAttributes.width) {
				img.style.width = `${HTMLAttributes.width}px`;
			}
			if (HTMLAttributes.height) {
				img.style.height = `${HTMLAttributes.height}px`;
			}

			// 리사이즈 컨테이너 생성
			const container = document.createElement("div");
			container.className = "image-resize-container";
			container.style.position = "relative";
			container.style.display = "block";
			container.style.maxWidth = "100%";
			container.style.width = "fit-content";
			container.style.margin = "1rem auto";

			// 이미지에 호버 효과를 위한 래퍼
			img.style.display = "block";
			img.style.maxWidth = "100%";
			img.style.height = "auto";

			container.appendChild(img);

			// 리사이즈 핸들 생성
			const createHandle = (position: string) => {
				const handle = document.createElement("div");
				handle.className = `resize-handle resize-handle-${position}`;
				handle.style.position = "absolute";

				// 우측 핸들은 세로로 길게, 우하단은 정사각형
				if (position === "right") {
					handle.style.width = "12px";
					handle.style.height = "48px";
				} else {
					handle.style.width = "32px";
					handle.style.height = "32px";
				}

				handle.style.backgroundColor = "transparent";
				handle.style.border = "none";
				handle.style.borderRadius = position === "right" ? "4px" : "6px";
				handle.style.zIndex = "10";
				handle.style.opacity = "0";
				handle.style.transition = "opacity 0.2s ease, transform 0.1s ease";
				handle.style.boxShadow = "none";
				handle.style.display = "flex";
				handle.style.alignItems = "center";
				handle.style.justifyContent = "center";
				handle.style.cursor =
					position === "right" ? "ew-resize" : "nwse-resize";
				handle.style.pointerEvents = "auto";

				// 위치 설정 (더 명확하게) - 이미지 영역 4px 바깥
				if (position === "right") {
					handle.style.top = "50%";
					handle.style.right = "-16px"; // 이미지 영역 4px 바깥 (12px 핸들 + 4px 간격)
					handle.style.transform = "translateY(-50%)";
				} else if (position === "bottom-right") {
					handle.style.bottom = "-16px"; // 이미지 영역 4px 바깥 (32px 핸들 + 4px 간격)
					handle.style.right = "-16px";
				} else {
					if (position.includes("top")) {
						handle.style.top = "-14px";
					}
					if (position.includes("bottom")) {
						handle.style.bottom = "-14px";
					}
					if (position.includes("left")) {
						handle.style.left = "-14px";
					}
					if (position.includes("right")) {
						handle.style.right = "-14px";
					}
				}

				// 호버 시 확대 효과 (우측 핸들은 translateY 고려)
				handle.addEventListener("mouseenter", () => {
					if (position === "right") {
						handle.style.transform = "translateY(-50%) scaleX(1.3)";
					} else {
						handle.style.transform = "scale(1.15)";
					}
					handle.style.backgroundColor = "transparent";
				});
				handle.addEventListener("mouseleave", () => {
					if (position === "right") {
						handle.style.transform = "translateY(-50%)";
					} else {
						handle.style.transform = "scale(1)";
					}
					handle.style.backgroundColor = "transparent";
				});

				// 커서 스타일 설정 (더 명확하게)
				if (position === "top-left") {
					handle.style.cursor = "nwse-resize";
				} else if (position === "top-right") {
					handle.style.cursor = "nesw-resize";
				} else if (position === "bottom-left") {
					handle.style.cursor = "nesw-resize";
				} else if (position === "bottom-right") {
					handle.style.cursor = "nwse-resize";
				} else if (position === "top" || position === "bottom") {
					handle.style.cursor = "ns-resize";
				} else if (position === "left") {
					handle.style.cursor = "ew-resize";
				} else if (position === "right") {
					handle.style.cursor = "ew-resize";
				}

				// 리사이즈 아이콘 SVG 추가
				const iconSvg = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"svg",
				);

				if (position === "right") {
					// 우측: 세로선 아이콘 (더 크고 명확하게)
					iconSvg.setAttribute("width", "4");
					iconSvg.setAttribute("height", "36");
					iconSvg.setAttribute("viewBox", "0 0 4 36");
					iconSvg.setAttribute("fill", "none");
					iconSvg.style.pointerEvents = "none";
					iconSvg.style.display = "block";
					iconSvg.style.margin = "0 auto";
					iconSvg.style.backgroundColor = "transparent";

					// 하얀색 outline path (먼저 그려서 배경 역할)
					const outlinePath = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"path",
					);
					outlinePath.setAttribute("d", "M2 2L2 34");
					outlinePath.setAttribute("stroke", "#FFFFFF");
					outlinePath.setAttribute("stroke-width", "4.5");
					outlinePath.setAttribute("stroke-linecap", "round");
					outlinePath.setAttribute("opacity", "0.8");
					iconSvg.appendChild(outlinePath);

					// 검정색 stroke path (위에 그려서 메인 라인) - 실선
					const path = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"path",
					);
					path.setAttribute("d", "M2 2L2 34");
					path.setAttribute("stroke", "#000000");
					path.setAttribute("stroke-width", "2.5");
					path.setAttribute("stroke-linecap", "round");
					iconSvg.appendChild(path);
				} else if (position === "bottom-right") {
					// 우하단: 각진 모양의 선 (L자 모양)
					iconSvg.setAttribute("width", "24");
					iconSvg.setAttribute("height", "24");
					iconSvg.setAttribute("viewBox", "0 0 24 24");
					iconSvg.setAttribute("fill", "none");
					iconSvg.style.pointerEvents = "none";
					iconSvg.style.display = "block";
					iconSvg.style.backgroundColor = "transparent";

					// 하얀색 outline path (먼저 그려서 배경 역할)
					const outlinePath = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"path",
					);
					outlinePath.setAttribute("d", "M4 20L20 20M20 20L20 4");
					outlinePath.setAttribute("stroke", "#FFFFFF");
					outlinePath.setAttribute("stroke-width", "6.5");
					outlinePath.setAttribute("stroke-linecap", "round");
					outlinePath.setAttribute("stroke-linejoin", "round");
					outlinePath.setAttribute("opacity", "0.8");
					iconSvg.appendChild(outlinePath);

					// 검정색 stroke path (위에 그려서 메인 라인)
					const path = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"path",
					);
					path.setAttribute("d", "M4 20L20 20M20 20L20 4");
					path.setAttribute("stroke", "#000000");
					path.setAttribute("stroke-width", "3.5");
					path.setAttribute("stroke-linecap", "round");
					path.setAttribute("stroke-linejoin", "round");
					iconSvg.appendChild(path);
				} else {
					// 기본: 대각선 화살표
					iconSvg.setAttribute("width", "16");
					iconSvg.setAttribute("height", "16");
					iconSvg.setAttribute("viewBox", "0 0 24 24");
					iconSvg.setAttribute("fill", "none");
					iconSvg.style.pointerEvents = "none";

					const path = document.createElementNS(
						"http://www.w3.org/2000/svg",
						"path",
					);
					path.setAttribute("d", "M8 8L16 16M16 8L8 16");
					path.setAttribute("stroke", "white");
					path.setAttribute("stroke-width", "2");
					path.setAttribute("stroke-linecap", "round");
					path.setAttribute("stroke-linejoin", "round");
					iconSvg.appendChild(path);
				}

				handle.appendChild(iconSvg);

				// 리사이즈 이벤트
				let isResizing = false;
				let startX = 0;
				let startY = 0;
				let startWidth = 0;
				let startHeight = 0;
				let aspectRatio = 1;

				// 우측 핸들은 나중에 별도 처리하므로 여기서는 이벤트 리스너 추가 안 함
				if (position !== "right") {
					handle.addEventListener("mousedown", (e) => {
						e.preventDefault();
						e.stopPropagation();

						// 리사이징 시작
						isResizing = true;
						startX = e.clientX;
						startY = e.clientY;
						startWidth = img.offsetWidth;
						startHeight = img.offsetHeight;
						aspectRatio = startWidth / startHeight;

						const handleMouseMove = (e: MouseEvent) => {
							if (!isResizing) return;

							const deltaX = e.clientX - startX;
							const deltaY = e.clientY - startY;
							let newWidth = startWidth;
							let newHeight = startHeight;

							// 순서 중요: bottom-right를 먼저 체크
							if (position === "bottom-right") {
								// 우하단: 가로/세로 동시 조정 (비율 유지)
								newWidth = Math.max(50, startWidth + deltaX);
								newHeight = newWidth / aspectRatio;
							} else if (position === "right") {
								// 우측 중간 핸들: 가로만 조정 (비율 유지)
								newWidth = Math.max(50, startWidth + deltaX);
								newHeight = newWidth / aspectRatio;
							} else if (
								position.includes("right") &&
								!position.includes("bottom")
							) {
								// 우측 상단 등
								newWidth = Math.max(50, startWidth + deltaX);
								newHeight = newWidth / aspectRatio;
							} else if (position.includes("left")) {
								newWidth = Math.max(50, startWidth - deltaX);
								newHeight = newWidth / aspectRatio;
							} else if (
								position.includes("bottom") &&
								!position.includes("right")
							) {
								// 하단만 (좌하단 등)
								newHeight = Math.max(50, startHeight + deltaY);
								newWidth = newHeight * aspectRatio;
							} else if (position.includes("top")) {
								newHeight = Math.max(50, startHeight - deltaY);
								newWidth = newHeight * aspectRatio;
							}

							img.style.width = `${newWidth}px`;
							img.style.height = `${newHeight}px`;
						};

						const handleMouseUp = () => {
							isResizing = false;
							const pos = getPos();
							if (pos !== undefined && editor) {
								editor.commands.updateAttributes("image", {
									width: img.offsetWidth,
									height: img.offsetHeight,
								});
							}
							document.removeEventListener("mousemove", handleMouseMove);
							document.removeEventListener("mouseup", handleMouseUp);
						};

						document.addEventListener("mousemove", handleMouseMove);
						document.addEventListener("mouseup", handleMouseUp);
					});
				}

				return handle;
			};

			// 리사이즈 핸들 추가 (우하단 + 우측 중간)
			const bottomRightHandle = createHandle("bottom-right");
			container.appendChild(bottomRightHandle);

			const rightHandle = createHandle("right");
			container.appendChild(rightHandle);

			// 우측 핸들 클릭 시 우하단 핸들의 리사이징 트리거
			rightHandle.addEventListener("mousedown", (e) => {
				e.preventDefault();
				e.stopPropagation();
				// 우하단 핸들의 mousedown 이벤트 트리거
				const bottomRightEvent = new MouseEvent("mousedown", {
					bubbles: true,
					cancelable: true,
					clientX: e.clientX,
					clientY: e.clientY,
					button: e.button,
				});
				bottomRightHandle.dispatchEvent(bottomRightEvent);
			});

			// 컨테이너 호버 시 핸들 표시
			container.addEventListener("mouseenter", () => {
				container.classList.add("is-hovering");
				// 핸들 표시
				bottomRightHandle.style.opacity = "1";
				rightHandle.style.opacity = "1";
			});
			container.addEventListener("mouseleave", () => {
				container.classList.remove("is-hovering");
				// 핸들 숨기기
				bottomRightHandle.style.opacity = "0";
				rightHandle.style.opacity = "0";
			});

			return {
				dom: container,
				update: (updatedNode: ProseMirrorNode) => {
					if (updatedNode.type !== node.type) return false;
					if (updatedNode.attrs.src !== node.attrs.src) {
						img.src = updatedNode.attrs.src as string;
					}
					return true;
				},
			};
		};
	},
});

interface TiptapEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
}

const TiptapEditor = ({
	content,
	onChange,
	placeholder,
}: TiptapEditorProps) => {
	const [showColorPicker, setShowColorPicker] = useState(false);
	const colorPickerRef = useRef<HTMLDivElement>(null);

	const handleFileDrop = useCallback(
		(editor: Editor, files: File[], _pos: number) => {
			files.forEach((file) => {
				if (file.type.startsWith("image/")) {
					// 파일 크기 제한 (10MB)
					if (file.size > 10 * 1024 * 1024) {
						alert("이미지 크기는 10MB 이하여야 합니다.");
						return;
					}

					// FileReader를 사용하여 base64로 변환
					const reader = new FileReader();
					reader.onloadend = () => {
						const base64String = reader.result as string;
						if (editor) {
							editor.chain().focus().setImage({ src: base64String }).run();
						}
					};
					reader.readAsDataURL(file);
				}
			});
		},
		[],
	);

	const handleFilePaste = useCallback(
		(editor: Editor, files: File[], _htmlContent?: string) => {
			files.forEach((file) => {
				if (file.type.startsWith("image/")) {
					// 파일 크기 제한 (10MB)
					if (file.size > 10 * 1024 * 1024) {
						alert("이미지 크기는 10MB 이하여야 합니다.");
						return;
					}

					// FileReader를 사용하여 base64로 변환
					const reader = new FileReader();
					reader.onloadend = () => {
						const base64String = reader.result as string;
						if (editor) {
							editor.chain().focus().setImage({ src: base64String }).run();
						}
					};
					reader.readAsDataURL(file);
				}
			});
		},
		[],
	);

	const editor = useEditor({
		extensions: [
			StarterKit,
			TextStyle,
			Color,
			FileHandler.configure({
				allowedMimeTypes: [
					"image/jpeg",
					"image/png",
					"image/gif",
					"image/webp",
				],
				onDrop: handleFileDrop,
				onPaste: handleFilePaste,
			}),
			ResizableDraggableImage.configure({
				inline: false,
				allowBase64: true,
			}),
		],
		content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		immediatelyRender: false,
		editorProps: {
			attributes: {
				class:
					"ProseMirror focus:outline-none min-h-[200px] p-3 text-sm text-[#262626]",
				"data-placeholder": placeholder || "",
			},
		},
	});

	// 색상 선택기 외부 클릭 시 닫기
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				colorPickerRef.current &&
				!colorPickerRef.current.contains(event.target as Node)
			) {
				setShowColorPicker(false);
			}
		};

		if (showColorPicker) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showColorPicker]);

	const colors = [
		// 기본 색상
		"#000000",
		"#333333",
		"#666666",
		"#999999",
		"#CCCCCC",
		"#FFFFFF",
		// 빨강 계열
		"#FF0000",
		"#FF3333",
		"#FF6666",
		"#FF9999",
		// 주황 계열
		"#FF6600",
		"#FF8833",
		"#FFAA66",
		"#FFCC99",
		// 노랑 계열
		"#FFCC00",
		"#FFDD33",
		"#FFEE66",
		"#FFFF99",
		// 초록 계열
		"#33CC00",
		"#55DD33",
		"#77EE66",
		"#99FF99",
		// 파랑 계열
		"#0066FF",
		"#3388FF",
		"#66AAFF",
		"#99CCFF",
		// 보라 계열
		"#6600FF",
		"#8833FF",
		"#AA66FF",
		"#CC99FF",
		// 분홍 계열
		"#CC00CC",
		"#DD33DD",
		"#EE66EE",
		"#FF99FF",
		// 핑크 계열
		"#FF0066",
		"#FF3388",
		"#FF66AA",
		"#FF99CC",
	];

	const handleColorSelect = (color: string) => {
		if (editor) {
			editor.chain().focus().setColor(color).run();
			setShowColorPicker(false);
		}
	};

	const handleImageUpload = useCallback(() => {
		const input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", "image/*");
		input.click();

		input.onchange = async () => {
			const file = input.files?.[0];
			if (file) {
				// 파일 크기 제한 (10MB)
				if (file.size > 10 * 1024 * 1024) {
					alert("이미지 크기는 10MB 이하여야 합니다.");
					return;
				}

				// FileReader를 사용하여 base64로 변환
				const reader = new FileReader();
				reader.onloadend = () => {
					const base64String = reader.result as string;
					if (editor) {
						editor.chain().focus().setImage({ src: base64String }).run();
					}
				};
				reader.readAsDataURL(file);
			}
		};
	}, [editor]);

	if (!editor) {
		return (
			<div className="w-full border border-[#D9D9D9] p-4 min-h-[200px] flex items-center justify-center">
				<span className="text-sm text-[#8C8C8C]">에디터를 불러오는 중...</span>
			</div>
		);
	}

	return (
		<div className="w-full border border-[#D9D9D9] rounded bg-white">
			{/* 툴바 */}
			<div className="flex items-center gap-0.5 p-2 border-b border-[#E5E5E5] bg-[#FAFAFA] flex-wrap">
				{/* 텍스트 스타일 */}
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={!editor.can().chain().focus().toggleBold().run()}
					className={`px-3 py-1.5 text-sm rounded hover:bg-white transition-colors ${
						editor.isActive("bold")
							? "bg-white text-[#133A1B] font-semibold"
							: "text-[#666666]"
					}`}
					aria-label="굵게"
				>
					<strong>B</strong>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={!editor.can().chain().focus().toggleItalic().run()}
					className={`px-3 py-1.5 text-sm rounded hover:bg-white transition-colors ${
						editor.isActive("italic")
							? "bg-white text-[#133A1B] font-semibold"
							: "text-[#666666]"
					}`}
					aria-label="기울임"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						className="w-4 h-4"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					disabled={!editor.can().chain().focus().toggleStrike().run()}
					className={`px-3 py-1.5 text-sm rounded hover:bg-white transition-colors ${
						editor.isActive("strike")
							? "bg-white text-[#133A1B] font-semibold"
							: "text-[#666666]"
					}`}
					aria-label="취소선"
				>
					<span className="line-through">S</span>
				</button>
				<div className="w-px h-5 bg-[#E5E5E5] mx-1" />
				{/* 색상 선택 */}
				<div className="relative" ref={colorPickerRef}>
					<button
						type="button"
						onClick={() => setShowColorPicker(!showColorPicker)}
						className={`px-3 py-1.5 text-sm rounded hover:bg-white transition-colors flex items-center gap-1 ${
							editor.isActive("textStyle")
								? "bg-white text-[#133A1B]"
								: "text-[#666666]"
						}`}
						aria-label="글자 색상"
					>
						<span>A</span>
						<div
							className="w-3 h-3 border border-[#D9D9D9] rounded"
							style={{
								backgroundColor:
									editor.getAttributes("textStyle").color || "#000000",
							}}
						/>
					</button>
					{showColorPicker && (
						<div className="absolute top-full left-0 mt-2 bg-white border border-[#D9D9D9] rounded-lg shadow-xl p-3 z-50 min-w-[280px]">
							<div className="grid grid-cols-8 gap-2">
								{colors.map((color) => (
									<button
										key={color}
										type="button"
										onClick={() => handleColorSelect(color)}
										className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 hover:shadow-md ${
											color === "#FFFFFF"
												? "border-[#D9D9D9] hover:border-[#999999]"
												: color === "#000000"
													? "border-[#333333] hover:border-[#000000]"
													: "border-transparent hover:border-[#666666]"
										}`}
										style={{ backgroundColor: color }}
										aria-label={`색상 ${color}`}
									/>
								))}
							</div>
						</div>
					)}
				</div>
				<div className="w-px h-5 bg-[#E5E5E5] mx-1" />
				{/* 제목 */}
				<button
					type="button"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 1 }).run()
					}
					className={`px-3 py-1.5 text-sm rounded hover:bg-white transition-colors ${
						editor.isActive("heading", { level: 1 })
							? "bg-white text-[#133A1B] font-semibold"
							: "text-[#666666]"
					}`}
					aria-label="제목 1"
				>
					H1
				</button>
				<button
					type="button"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					className={`px-3 py-1.5 text-sm rounded hover:bg-white transition-colors ${
						editor.isActive("heading", { level: 2 })
							? "bg-white text-[#133A1B] font-semibold"
							: "text-[#666666]"
					}`}
					aria-label="제목 2"
				>
					H2
				</button>
				<div className="w-px h-5 bg-[#E5E5E5] mx-1" />
				{/* 리스트 */}
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={`px-3 py-1.5 rounded hover:bg-white transition-colors ${
						editor.isActive("bulletList")
							? "bg-white text-[#133A1B]"
							: "text-[#666666]"
					}`}
					aria-label="불릿 리스트"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						className="w-4 h-4"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
					</svg>
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={`px-3 py-1.5 rounded hover:bg-white transition-colors ${
						editor.isActive("orderedList")
							? "bg-white text-[#133A1B]"
							: "text-[#666666]"
					}`}
					aria-label="번호 리스트"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						className="w-4 h-4"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2l1.8-2.1V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
					</svg>
				</button>
				<div className="w-px h-5 bg-[#E5E5E5] mx-1" />
				{/* 이미지 */}
				<button
					type="button"
					onClick={handleImageUpload}
					className="px-3 py-1.5 rounded hover:bg-white transition-colors text-[#666666]"
					aria-label="이미지 삽입"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						className="w-4 h-4"
						fill="currentColor"
						aria-hidden="true"
					>
						<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
					</svg>
				</button>
			</div>
			{/* 에디터 영역 */}
			<div className="min-h-[200px]">
				<EditorContent editor={editor} />
			</div>
		</div>
	);
};

export default TiptapEditor;
