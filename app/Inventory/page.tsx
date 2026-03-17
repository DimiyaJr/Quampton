"use client";
import { Card, CardBody } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { useRouter } from "next/navigation";

export default function Inventory() {
  const router = useRouter();

  const list = [
    {
      title: "PRODUCTS",
      img: "/productslogo.svg",
      href: "Inventory/Products",
    },
    {
      title: "PRODUCT CATEGORIES",
      img: "/productscatogories.svg",
      href: "Inventory/ProductCategories",
    },
    {
      title: "PURCHASE ORDERS",
      img: "/purchaseorders.svg",
      href: "Inventory/PurchaseOrder",
    },
  ];

  return (
    <div className="container mx-auto px-4 max-w-[1300px]">
      <h1 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold text-black pb-8 pt-10 md:pb-12 md:pt-16">INVENTORY</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {list.map((item, index) => (
          <Card
            key={index}
            radius="lg"
            isPressable
            className="w-full h-[160px] sm:h-[200px] md:h-[250px] bg-purple-500 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
            onClick={() => router.push(item.href)}
          >
            <CardBody className="flex flex-col items-center justify-center p-4">
              <Image
                src={item.img}
                alt={`Image for ${item.title}`}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 filter brightness-0"
              />
              <p className="text-white text-sm sm:text-base md:text-lg font-semibold mt-3 md:mt-4 text-center">
                {item.title}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
