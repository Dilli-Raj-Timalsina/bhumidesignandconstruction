import { notFound } from "next/navigation";

import { getAdminPost } from "@/components/admin/admin-data";
import { PostForm } from "@/components/admin/content-forms";
import { PageHeader } from "@/components/admin/page-header";

type PostEditPageProps = { params: Promise<{ id: string }> };

export default async function PostEditPage({ params }: PostEditPageProps) {
  const post = await getAdminPost((await params).id);
  if (!post) notFound();
  return (
    <>
      <PageHeader
        title="Edit article"
        description="Update its content, publication details, and search metadata."
        backHref="/admin/posts"
      />
      <PostForm post={post} />
    </>
  );
}
