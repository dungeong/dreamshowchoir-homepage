
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2';
import { Plus, Pencil, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
    getFaqList,
    createFaq,
    updateFaq,
    deleteFaq,
    FaqDto,
    Faq
} from '@/api/faqApi';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-gray-50 flex items-center justify-center">Loading Editor...</div>,
});
import 'react-quill-new/dist/quill.snow.css';

export default function FaqManagementPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
    const [formData, setFormData] = useState<FaqDto>({ question: '', answer: '' });

    // Queries
    const { data: faqs, isLoading } = useQuery({
        queryKey: ['faq'],
        queryFn: getFaqList,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: (dto: FaqDto) => createFaq(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faq'] });
            closeModal();
            Swal.fire({
                title: '성공',
                text: 'FAQ가 등록되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: () => Swal.fire('실패', 'FAQ 등록에 실패했습니다.', 'error')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: FaqDto }) => updateFaq(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faq'] });
            closeModal();
            Swal.fire({
                title: '성공',
                text: 'FAQ가 수정되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: () => Swal.fire('실패', 'FAQ 수정에 실패했습니다.', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteFaq(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faq'] });
            Swal.fire({
                title: '삭제됨',
                text: 'FAQ가 삭제되었습니다.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: () => Swal.fire('실패', 'FAQ 삭제에 실패했습니다.', 'error')
    });

    const handleDelete = (id: number) => {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "이 작업은 되돌릴 수 없습니다.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate(id);
            }
        });
    };

    const openCreateModal = () => {
        setEditingFaq(null);
        setFormData({ question: '', answer: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (faq: Faq) => {
        setEditingFaq(faq);
        setFormData({ question: faq.question, answer: faq.answer });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFaq(null);
        setFormData({ question: '', answer: '' });
    };

    const handleSubmit = () => {
        if (!formData.question.trim() || !formData.answer.trim()) {
            Swal.fire('경고', '질문과 답변을 모두 입력해주세요.', 'warning');
            return;
        }

        if (editingFaq) {
            updateMutation.mutate({ id: editingFaq.faqId, dto: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    // Quill modules
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image'
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">FAQ 관리</h1>
                <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    FAQ 등록
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : faqs && faqs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq) => (
                            <AccordionItem key={faq.faqId} value={`item-${faq.faqId}`} className="border-b border-gray-100">
                                <div className="flex items-center justify-between py-4 pr-4">
                                    <AccordionTrigger className="hover:no-underline flex-1 text-left font-medium text-gray-900 text-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-primary font-bold">Q.</span>
                                            {faq.question}
                                        </div>
                                    </AccordionTrigger>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditModal(faq);
                                            }}
                                            className="text-gray-500 hover:text-primary hover:bg-gray-100"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(faq.faqId);
                                            }}
                                            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                <AccordionContent className="bg-gray-50 rounded-lg p-6 mt-1 mb-4 prose max-w-none text-gray-600">
                                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        등록된 FAQ가 없습니다.
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editingFaq ? 'FAQ 수정' : 'FAQ 등록'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="question">질문</Label>
                            <Input
                                id="question"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="질문을 입력하세요"
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col">
                            <Label htmlFor="answer">답변</Label>
                            <div className="flex-1 min-h-[300px]">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.answer}
                                    onChange={(content) => setFormData({ ...formData, answer: content })}
                                    modules={modules}
                                    formats={formats}
                                    className="h-full pb-10" // Padding for toolbar
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={closeModal} disabled={createMutation.isPending || updateMutation.isPending}>
                            취소
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {editingFaq ? '수정' : '등록'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
